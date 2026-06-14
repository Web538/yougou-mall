package com.yougou.product.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 商品分页查询 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 关键词（商品名称/描述，支持模糊搜索）
     */
    private String keyword;

    /**
     * 商品分类（精确匹配）
     */
    private String category;

    /**
     * 商品状态（0-下架，1-上架）
     */
    private Integer status;

    /**
     * 当前页码（从 1 开始，默认 1）
     */
    @Min(value = 1, message = "页码最小为 1")
    private Long current;

    /**
     * 每页条数（默认 10，最大 100）
     */
    @Min(value = 1, message = "每页条数最小为 1")
    @Max(value = 100, message = "每页条数最大为 100")
    private Long size;

    /**
     * 排序字段（默认 createTime）
     */
    private String sortBy;

    /**
     * 排序方向：asc / desc（默认 desc）
     */
    private String sortOrder;

    // ==================== 参数校验与默认值 ====================

    /**
     * 获取当前页（默认值 1）
     */
    public Long getCurrent() {
        return current != null && current > 0 ? current : 1L;
    }

    /**
     * 获取每页条数（默认值 10）
     */
    public Long getSize() {
        return size != null && size > 0 ? Math.min(size, 100L) : 10L;
    }

    /**
     * 获取排序字段（默认按创建时间）
     */
    public String getSortBy() {
        return sortBy != null && !sortBy.isBlank() ? sortBy : "createTime";
    }

    /**
     * 获取排序方向（默认降序）
     */
    public String getSortOrder() {
        return "asc".equalsIgnoreCase(sortOrder) ? "asc" : "desc";
    }
}
