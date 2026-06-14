package com.yougou.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 更新商品请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 商品ID（必填）
     */
    @NotNull(message = "商品 ID 不能为空")
    private Long id;

    /**
     * 商品名称（可选，2-100字符）
     */
    @NotBlank(message = "商品名称不能为空")
    @Size(min = 2, max = 100, message = "商品名称长度必须在 2-100 个字符之间")
    private String name;

    /**
     * 商品分类（可选）
     */
    @NotBlank(message = "商品分类不能为空")
    private String category;

    /**
     * 商品价格（可选，必须大于 0）
     */
    @NotNull(message = "商品价格不能为空")
    @DecimalMin(value = "0.01", message = "商品价格必须大于 0")
    @Digits(integer = 10, fraction = 2, message = "商品价格格式错误，最多两位小数")
    private BigDecimal price;

    /**
     * 商品库存（可选，0-999999）
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
     * 商品状态：0-下架，1-上架
     */
    private Integer status;
}
