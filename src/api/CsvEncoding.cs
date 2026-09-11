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
    private static readonly byte[] utf8Mark = [0xEF, 0xBB, 0xBF];
    private static readonly byte[] utf16LittleEndianMark = [0xFF, 0xFE];
    private static readonly byte[] utf16BigEndianMark = [0xFE, 0xFF];
    private static readonly byte[] utf32BigEndianMark = [0x00, 0x00, 0xFE, 0xFF];

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
        bool trustByteOrderMark;

        // IFormFile hands out a fresh view over the buffered request body on every call, so probing
        // and reading use independent streams and neither has to be rewound.
        using (var probe = file.OpenReadStream())
        {
            var (isUtf8, hasUtf8Mark, looksWide) = Probe(probe);

            // StreamReader's own detection overrides whatever encoding it is handed, so it is enabled
            // only for a mark worth trusting. Every byte value is legal Windows-1252, so a file whose
            // first characters happen to be "ÿþ" would otherwise be read as UTF-16: exactly the
            // mojibake this class exists to prevent.
            trustByteOrderMark = hasUtf8Mark || looksWide;
            encoding = isUtf8 || trustByteOrderMark ? Encoding.UTF8 : ansiFallback;
        }

        return new StreamReader(file.OpenReadStream(), encoding, trustByteOrderMark);
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

    /// <summary>
    /// Classifies the bytes of <paramref name="stream"/> in a single pass.
    /// </summary>
    /// <returns>
    /// Whether the whole stream is valid UTF-8, whether it opens with a UTF-8 byte order mark, and
    /// whether it opens with a UTF-16 or UTF-32 mark followed by the NUL bytes that such an encoding
    /// produces. Windows-1252 text contains no NUL bytes, which is what separates a real wide mark
    /// from a Windows-1252 file that merely starts with the same byte values.
    /// </returns>
    private static (bool IsUtf8, bool HasUtf8Mark, bool LooksWide) Probe(Stream stream)
    {
        // A stateful decoder carries an incomplete multi byte sequence across chunk boundaries, so a
        // sequence split by the buffer size is not mistaken for invalid input.
        var decoder = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false, throwOnInvalidBytes: true).GetDecoder();
        var bytes = new byte[ProbeBufferSize];
        var chars = new char[Encoding.UTF8.GetMaxCharCount(ProbeBufferSize)];
        var hasUtf8Mark = false;
        var looksWide = false;
        var isFirstChunk = true;

        try
        {
            int read;
            while ((read = stream.Read(bytes, 0, bytes.Length)) > 0)
            {
                if (isFirstChunk)
                {
                    var head = bytes.AsSpan(0, read);
                    hasUtf8Mark = head.StartsWith(utf8Mark);
                    looksWide = (head.StartsWith(utf16LittleEndianMark) || head.StartsWith(utf16BigEndianMark) || head.StartsWith(utf32BigEndianMark))
                        && head.Contains((byte)0);
                    isFirstChunk = false;
                }

                decoder.GetChars(bytes, 0, read, chars, 0, flush: false);
            }

            // Flushing surfaces a sequence that was left incomplete at the end of the file.
            decoder.GetChars(bytes, 0, 0, chars, 0, flush: true);
            return (true, hasUtf8Mark, looksWide);
        }
        catch (DecoderFallbackException)
        {
            return (false, hasUtf8Mark, looksWide);
        }
    }
}
