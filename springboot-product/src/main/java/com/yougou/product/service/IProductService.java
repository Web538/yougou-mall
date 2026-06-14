package com.yougou.product.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.yougou.product.dto.CreateProductDTO;
import com.yougou.product.dto.ProductQueryDTO;
import com.yougou.product.dto.UpdateProductDTO;
import com.yougou.product.entity.Product;
import com.yougou.product.vo.ProductVO;

import java.util.List;

/**
 * 商品 Service 接口
 */
public interface IProductService {

    /**
     * 创建商品
     *
     * @param dto 创建参数
     * @return 新增商品 ID
     */
    Long createProduct(CreateProductDTO dto);

    /**
     * 更新商品
     *
     * @param dto 更新参数
     */
    void updateProduct(UpdateProductDTO dto);

    /**
     * 删除商品（物理删除）
     *
     * @param id 商品 ID
     */
    void deleteProduct(Long id);

    /**
     * 批量删除商品
     *
     * @param ids 商品 ID 列表
     */
    void deleteProducts(List<Long> ids);

    /**
     * 根据 ID 查询商品详情
     *
     * @param id 商品 ID
     * @return 商品信息
     */
    ProductVO getProductById(Long id);

    /**
     * 分页查询商品列表
     *
     * @param queryDTO 查询参数
     * @return 分页结果
     */
    IPage<ProductVO> queryProducts(ProductQueryDTO queryDTO);

    /**
     * 更新商品库存（扣减库存，用于下单）
     *
     * @param productId 商品 ID
     * @param quantity 扣减数量
     */
    void reduceStock(Long productId, Integer quantity);
}
