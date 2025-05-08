namespace BDMS.Models;

public class WorkflowChangeRequest
{
    public int BoreholeId { get; set; }

    public WorkflowStatus NewStatus { get; set; }

    public string Comment { get; set; }

    public int? NewAssigneeId { get; set; }
}
