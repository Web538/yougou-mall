package com.yougou.product.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yougou.product.entity.Product;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 商品 Mapper 接口（继承 MyBatis Plus BaseMapper）
 */
@Mapper
public interface ProductMapper extends BaseMapper<Product> {

    /**
     * 分页查询商品（带关键词 + 分类 + 状态过滤）
     *
     * @param page     分页对象
     * @param keyword  关键词（商品名称/描述，模糊搜索）
     * @param category 分类（精确匹配，null 表示不限制）
     * @param status   状态（null 表示不限制）
     * @param sortBy   排序字段
     * @param sortOrder 排序方向（asc / desc）
     * @return 分页结果
     */
    IPage<Product> selectProductPage(
            Page<Product> page,
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("status") Integer status,
            @Param("sortBy") String sortBy,
            @Param("sortOrder") String sortOrder
    );

    /**
     * 检查商品名称是否存在（排除自身，用于更新时校验）
     *
     * @param name 商品名称
     * @param excludeId 排除的商品 ID（更新时传自身 ID，新建时传 null）
     * @return 存在返回 true
     */
    int countByNameExcludingId(@Param("name") String name, @Param("excludeId") Long excludeId);
}
