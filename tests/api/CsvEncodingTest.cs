using System.Text;
using static BDMS.Helpers;

namespace BDMS;

[TestClass]
public class CsvEncodingTest
{
    private const string CsvWithAccents = "Name;Comment\r\nForêt;café à côté\r\n";

    [TestMethod]
    public void ToUtf8BomBytesPrependsBom()
    {
        var bytes = CsvEncoding.ToUtf8BomBytes("Id;Name\r\n");

        CollectionAssert.AreEqual(new byte[] { 0xEF, 0xBB, 0xBF }, bytes.Take(3).ToArray());
        Assert.AreEqual("Id;Name\r\n", Encoding.UTF8.GetString(bytes, 3, bytes.Length - 3));
    }

    [TestMethod]
    public void WithUtf8BomEncodesToTheSameBytes()
    {
        CollectionAssert.AreEqual(
            CsvEncoding.ToUtf8BomBytes("Id;Name\r\n"),
            Encoding.UTF8.GetBytes(CsvEncoding.WithUtf8Bom("Id;Name\r\n")));
    }

    [TestMethod]
    public void OpenTextReadsUtf8()
    {
        var file = GetFormFileByContent(CsvWithAccents, "utf8.csv", new UTF8Encoding(encoderShouldEmitUTF8Identifier: false));

        using var reader = CsvEncoding.OpenText(file);

        Assert.AreEqual(CsvWithAccents, reader.ReadToEnd());
    }

    [TestMethod]
    public void OpenTextConsumesTheByteOrderMark()
    {
        var file = GetFormFileByContent(CsvWithAccents, "utf8bom.csv", new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));

        using var reader = CsvEncoding.OpenText(file);

        var content = reader.ReadToEnd();
        Assert.AreEqual(CsvWithAccents, content);
        Assert.IsFalse(content.StartsWith('\uFEFF'), "A leaked byte order mark would corrupt the first CSV header name.");
    }

    [TestMethod]
    public void OpenTextFallsBackToWindows1252()
    {
        var file = GetFormFileByContent(CsvWithAccents, "ansi.csv", Windows1252());

        using var reader = CsvEncoding.OpenText(file);

        Assert.AreEqual(CsvWithAccents, reader.ReadToEnd());
    }

    [TestMethod]
    public void OpenTextDecodesTheWindows1252SpecificRange()
    {
        // 0x80 to 0x9F is the only range where Windows-1252 and ISO-8859-1 disagree. Reading this
        // correctly is why the CodePages package is worth a dependency over the built in Encoding.Latin1.
        var content = "Name\r\n€ „ Š œ\r\n";
        var file = GetFormFileByContent(content, "ansi_punctuation.csv", Windows1252());

        using var reader = CsvEncoding.OpenText(file);

        Assert.AreEqual(content, reader.ReadToEnd());
    }

    [TestMethod]
    public void OpenTextReadsAsciiUnchanged()
    {
        var content = "Id;Name\r\n1;Test\r\n";
        var file = GetFormFileByContent(content, "ascii.csv", Encoding.ASCII);

        using var reader = CsvEncoding.OpenText(file);

        Assert.AreEqual(content, reader.ReadToEnd());
    }

    [TestMethod]
    public void OpenTextDetectsUtf8AcrossTheProbeBufferBoundary()
    {
        // Places a two byte sequence exactly on the 8 KB probe boundary. A stateless per chunk
        // validation would see two truncated halves and wrongly fall back to Windows-1252.
        var padding = new string('a', 8191);
        var content = padding + "é" + padding;
        var file = GetFormFileByContent(content, "boundary.csv", new UTF8Encoding(encoderShouldEmitUTF8Identifier: false));

        using var reader = CsvEncoding.OpenText(file);

        Assert.AreEqual(content, reader.ReadToEnd());
    }

    private static Encoding Windows1252()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        return Encoding.GetEncoding(1252);
    }
}
