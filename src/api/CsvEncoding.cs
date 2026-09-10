using System.Text;

namespace BDMS;

/// <summary>
/// Reads and writes the character encoding of CSV payloads.
/// Exports carry a UTF-8 byte order mark because Excel otherwise opens them with the local ANSI
/// codepage and renders accented characters as mojibake. Imports accept both UTF-8 and the
/// Windows-1252 files that Excel writes for "Save As -> CSV".
/// </summary>
internal static class CsvEncoding
{
    private const int ProbeBufferSize = 8192;

    private static readonly Encoding ansiFallback = CreateAnsiFallback();

    /// <summary>
    /// Encodes <paramref name="csv"/> as UTF-8 with a leading byte order mark.
    /// </summary>
    /// <param name="csv">The CSV content to encode.</param>
    internal static byte[] ToUtf8BomBytes(string csv) => Encoding.UTF8.GetBytes(WithUtf8Bom(csv));

    /// <summary>
    /// Prefixes <paramref name="csv"/> with U+FEFF, for results that encode the string themselves.
    /// </summary>
    /// <param name="csv">The CSV content to prefix.</param>
    internal static string WithUtf8Bom(string csv) => $"\uFEFF{csv}";

    /// <summary>
    /// Opens <paramref name="file"/> for reading, decoding it as UTF-8 when its bytes are valid
    /// UTF-8 and as Windows-1252 otherwise. A byte order mark, if present, is consumed rather than
    /// returned as the first character. The caller owns the returned reader and its stream.
    /// </summary>
    /// <param name="file">The uploaded CSV file.</param>
    internal static StreamReader OpenText(IFormFile file)
    {
        Encoding encoding;

        // IFormFile hands out a fresh view over the buffered request body on every call, so probing
        // and reading use independent streams and neither has to be rewound.
        using (var probe = file.OpenReadStream())
        {
            encoding = IsValidUtf8(probe) ? Encoding.UTF8 : ansiFallback;
        }

        return new StreamReader(file.OpenReadStream(), encoding, detectEncodingFromByteOrderMarks: true);
    }

    /// <summary>
    /// Codepage encodings have to be registered before <see cref="Encoding.GetEncoding(int)"/>
    /// resolves them. Registering here rather than at startup keeps the class usable in unit tests,
    /// which construct controllers directly and never execute Program.cs.
    /// </summary>
    private static Encoding CreateAnsiFallback()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        return Encoding.GetEncoding(1252);
    }

    private static bool IsValidUtf8(Stream stream)
    {
        // A stateful decoder carries an incomplete multi byte sequence across chunk boundaries, so a
        // sequence split by the buffer size is not mistaken for invalid input.
        var decoder = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false, throwOnInvalidBytes: true).GetDecoder();
        var bytes = new byte[ProbeBufferSize];
        var chars = new char[Encoding.UTF8.GetMaxCharCount(ProbeBufferSize)];

        try
        {
            int read;
            while ((read = stream.Read(bytes, 0, bytes.Length)) > 0)
            {
                decoder.GetChars(bytes, 0, read, chars, 0, flush: false);
            }

            // Flushing surfaces a sequence that was left incomplete at the end of the file.
            decoder.GetChars(bytes, 0, 0, chars, 0, flush: true);
            return true;
        }
        catch (DecoderFallbackException)
        {
            return false;
        }
    }
}
