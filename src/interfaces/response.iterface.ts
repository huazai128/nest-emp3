export interface Pagination {
  /** 文档总数 */
  totalDocs: number;
  /** 每页限制 */
  limit: number;
  /** 总页数 */
  totalPages: number;
  /** 当前页 */
  page: number;
  /** 分页计数器 */
  pagingCounter: number;
  /** 是否有上一页 */
  hasPrevPage: boolean;
  /** 是否有下一页 */
  hasNextPage: boolean;
  /** 上一页编号 */
  prevPage: number;
  /** 下一页编号 */
  nextPage: number;
}

export interface ResponsePaginationData<T> {
  data: Array<T>;
  pagination: Pagination;
}

export interface ResponseData<T = any> {
  message: string;
  result: T;
  status: 'success' | 'error';
}
