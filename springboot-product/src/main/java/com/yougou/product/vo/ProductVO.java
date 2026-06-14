package com.yougou.product.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品视图对象（用于接口返回）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String name;

    private String category;

    private BigDecimal price;

    private Integer stock;

    private String description;

    private String imageUrl;

    /**
     * 商品状态：0-下架，1-上架
     */
    private Integer status;

    /**
     * 状态文字描述
     */
    private String statusText;

    private Integer sales;

    private BigDecimal rating;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    /**
     * 将实体转换为 VO
     */
    public static ProductVO fromEntity(com.yougou.product.entity.Product product) {
        if (product == null) return null;
        return ProductVO.builder()
                .id(product.getId())
                .name(product.getName())
                .category(product.getCategory())
                .price(product.getPrice())
                .stock(product.getStock())
                .description(product.getDescription())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus())
                .statusText(product.getStatus() != null && product.getStatus() == 1 ? "上架" : "下架")
                .sales(product.getSales())
                .rating(product.getRating())
                .createTime(product.getCreateTime())
                .updateTime(product.getUpdateTime())
                .build();
    }
}
