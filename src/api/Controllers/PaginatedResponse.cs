namespace BDMS.Controllers;

/// <summary>
/// Represents a paginated response containing a subset of items along with pagination info.
/// </summary>
/// <typeparam name="T">The type of the items contained in the paginated response.</typeparam>
public class PaginatedResponse<T>
{
    /// <summary>
    /// Gets or sets the total count of items.
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Gets or sets the current page number.
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Gets or sets the size of the page (number of items per page).
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Gets or sets the maximum allowed size of the page.
    /// </summary>
    public int MaxPageSize { get; set; }

    /// <summary>
    /// Gets or sets the items contained in the current page.
    /// </summary>
    public IEnumerable<T> Items { get; set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="PaginatedResponse{T}"/> class.
    /// </summary>
    /// <param name="items">The items contained in the current page.</param>
    /// <param name="totalCount">The total count of items.</param>
    /// <param name="pageNumber">The current page number.</param>
    /// <param name="pageSize">The size of the page (number of items per page).</param>
    /// <param name="maxPageSize">The maximum allowed size of the page.</param>
    public PaginatedResponse(IEnumerable<T> items, int totalCount, int pageNumber, int pageSize, int maxPageSize)
    {
        Items = items;
        TotalCount = totalCount;
        PageNumber = pageNumber;
        PageSize = pageSize;
        MaxPageSize = maxPageSize;
    }
}
