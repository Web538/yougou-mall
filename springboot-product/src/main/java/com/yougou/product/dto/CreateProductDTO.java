package com.yougou.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 创建商品请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 商品名称（必填，2-100字符）
     */
    @NotBlank(message = "商品名称不能为空")
    @Size(min = 2, max = 100, message = "商品名称长度必须在 2-100 个字符之间")
    private String name;

    /**
     * 商品分类（必填）
     */
    @NotBlank(message = "商品分类不能为空")
    private String category;

    /**
     * 商品价格（必填，必须大于 0）
     */
    @NotNull(message = "商品价格不能为空")
    @DecimalMin(value = "0.01", message = "商品价格必须大于 0")
    @Digits(integer = 10, fraction = 2, message = "商品价格格式错误，最多两位小数")
    private BigDecimal price;

    /**
     * 商品库存（必填，0-999999）
     */
    @NotNull(message = "商品库存不能为空")
    @Min(value = 0, message = "商品库存不能为负数")
    @Max(value = 999999, message = "商品库存不能超过 999999")
    private Integer stock;

    /**
     * 商品描述（可选，最大500字符）
     */
    @Size(max = 500, message = "商品描述不能超过 500 个字符")
    private String description;

    /**
     * 商品图片 URL（可选）
     */
    private String imageUrl;

    /**
     * 商品状态（可选，默认上架：1）
     */
    private Integer status;

    /**
     * 销量（可选，默认 0）
     */
    private Integer sales;

    /**
     * 评分（可选，1.0-5.0）
     */
    @DecimalMin(value = "1.0", message = "评分最低为 1.0")
    @DecimalMax(value = "5.0", message = "评分最高为 5.0")
    private BigDecimal rating;
}
