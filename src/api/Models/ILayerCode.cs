using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;

public interface ILayerCode
{
    int LayerId { get; set; }
    Layer Layer { get; set; }
    int CodelistId { get; set; }
    Codelist Codelist { get; set; }
}
