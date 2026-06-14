package com.yougou.product.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 商品实体类
 */
@Data
@TableName("t_product")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 商品ID（主键）
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 商品名称
     */
    private String name;

    /**
     * 商品分类
     */
    private String category;

    /**
     * 商品价格（元）
     */
    private BigDecimal price;

    /**
     * 商品库存（件）
     */
    private Integer stock;

    /**
     * 商品描述
     */
    private String description;

    /**
     * 商品图片 URL
     */
    private String imageUrl;

    /**
     * 商品状态：0-下架，1-上架
     */
    private Integer status;

    /**
     * 销量
     */
    private Integer sales;

    /**
     * 商品评分（1-5）
     */
    private BigDecimal rating;

    /**
     * 创建时间（自动填充）
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间（自动填充）
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 逻辑删除标记（0-未删除，1-已删除）
     * MyBatis Plus 自动处理逻辑删除
     */
    @TableLogic
    private Integer deleted;
}
