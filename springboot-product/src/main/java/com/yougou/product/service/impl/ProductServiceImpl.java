package com.yougou.product.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.yougou.product.common.BusinessException;
import com.yougou.product.common.ResultCode;
import com.yougou.product.dto.CreateProductDTO;
import com.yougou.product.dto.ProductQueryDTO;
import com.yougou.product.dto.UpdateProductDTO;
import com.yougou.product.entity.Product;
import com.yougou.product.mapper.ProductMapper;
import com.yougou.product.service.IProductService;
import com.yougou.product.vo.ProductVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 商品 Service 实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {

    private final ProductMapper productMapper;

    // ==================== 创建商品 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createProduct(CreateProductDTO dto) {
        // 1. 检查商品名称是否已存在
        int existCount = productMapper.countByNameExcludingId(dto.getName(), null);
        if (existCount > 0) {
            throw new BusinessException(ResultCode.PRODUCT_NAME_EXIST);
        }

        // 2. 构建实体
        Product product = Product.builder()
                .name(dto.getName().trim())
                .category(dto.getCategory().trim())
                .price(dto.getPrice())
                .stock(dto.getStock() != null ? dto.getStock() : 0)
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .imageUrl(dto.getImageUrl())
                .status(dto.getStatus() != null ? dto.getStatus() : 1) // 默认上架
                .sales(dto.getSales() != null ? dto.getSales() : 0)
                .rating(dto.getRating() != null ? dto.getRating() : new BigDecimal("5.0"))
                .build();

        // 3. 插入数据库
        int rows = productMapper.insert(product);
        if (rows == 0) {
            throw new BusinessException(ResultCode.PRODUCT_UPDATE_FAILED, "商品创建失败，请重试");
        }

        log.info("[商品创建] id={}, name={}", product.getId(), product.getName());
        return product.getId();
    }

    // ==================== 更新商品 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateProduct(UpdateProductDTO dto) {
        // 1. 检查商品是否存在
        Product existProduct = productMapper.selectById(dto.getId());
        if (existProduct == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_FOUND);
        }

        // 2. 检查商品名称是否与其他商品重复
        int existCount = productMapper.countByNameExcludingId(dto.getName().trim(), dto.getId());
        if (existCount > 0) {
            throw new BusinessException(ResultCode.PRODUCT_NAME_EXIST);
        }

        // 3. 更新字段
        Product updateProduct = Product.builder()
                .id(dto.getId())
                .name(dto.getName().trim())
                .category(dto.getCategory().trim())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .description(dto.getDescription() != null ? dto.getDescription().trim() : null)
                .imageUrl(dto.getImageUrl())
                .status(dto.getStatus())
                .build();

        int rows = productMapper.updateById(updateProduct);
        if (rows == 0) {
            throw new BusinessException(ResultCode.PRODUCT_UPDATE_FAILED, "商品更新失败，请重试");
        }

        log.info("[商品更新] id={}, name={}", dto.getId(), dto.getName());
    }

    // ==================== 删除商品 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(Long id) {
        // 检查商品是否存在
        Product existProduct = productMapper.selectById(id);
        if (existProduct == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_FOUND);
        }

        int rows = productMapper.deleteById(id);
        if (rows == 0) {
            throw new BusinessException(ResultCode.PRODUCT_DELETE_FAILED);
        }

        log.info("[商品删除] id={}", id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteProducts(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new BusinessException(ResultCode.IDS_IS_NULL);
        }

        int rows = productMapper.deleteBatchIds(ids);
        log.info("[批量删除商品] ids={}, affected={}", ids, rows);
    }

    // ==================== 查询商品 ====================

    @Override
    public ProductVO getProductById(Long id) {
        if (id == null) {
            throw new BusinessException(ResultCode.ID_IS_NULL);
        }

        Product product = productMapper.selectById(id);
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_FOUND);
        }

        return ProductVO.fromEntity(product);
    }

    @Override
    public IPage<ProductVO> queryProducts(ProductQueryDTO queryDTO) {
        // 构建分页对象
        Page<Product> page = new Page<>(
                queryDTO.getCurrent(),   // 当前页
                queryDTO.getSize()       // 每页条数
        );

        // 构建动态查询条件
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();

        // 关键词模糊搜索（名称或描述）
        String keyword = queryDTO.getKeyword();
        if (keyword != null && !keyword.isBlank()) {
            wrapper.and(w ->
                    w.like(Product::getName, keyword)
                     .or()
                     .like(Product::getDescription, keyword)
            );
        }

        // 分类精确匹配
        String category = queryDTO.getCategory();
        if (category != null && !category.isBlank()) {
            wrapper.eq(Product::getCategory, category);
        }

        // 状态过滤
        Integer status = queryDTO.getStatus();
        if (status != null) {
            wrapper.eq(Product::getStatus, status);
        }

        // 动态排序
        String sortBy = queryDTO.getSortBy();
        boolean isAsc = "asc".equalsIgnoreCase(queryDTO.getSortOrder());

        switch (sortBy != null ? sortBy.toLowerCase() : "createtime") {
            case "price":
                wrapper.orderBy(true, isAsc, Product::getPrice);
                break;
            case "sales":
                wrapper.orderBy(true, isAsc, Product::getSales);
                break;
            case "rating":
                wrapper.orderBy(true, isAsc, Product::getRating);
                break;
            case "stock":
                wrapper.orderBy(true, isAsc, Product::getStock);
                break;
            case "createtime":
            default:
                wrapper.orderBy(true, isAsc, Product::getCreateTime);
                break;
        }

        // 执行分页查询（MyBatis Plus 原生实现）
        IPage<Product> productPage = productMapper.selectPage(page, wrapper);

        // 转换为 VO
        return productPage.convert(ProductVO::fromEntity);
    }

    // ==================== 扣减库存 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reduceStock(Long productId, Integer quantity) {
        Product product = productMapper.selectById(productId);
        if (product == null) {
            throw new BusinessException(ResultCode.PRODUCT_NOT_FOUND);
        }
        if (product.getStock() < quantity) {
            throw new BusinessException(ResultCode.PRODUCT_INSUFFICIENT_STOCK);
        }

        // 乐观锁扣减库存
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Product::getId, productId)
               .ge(Product::getStock, quantity);
        Product update = Product.builder().id(productId)
                .stock(product.getStock() - quantity).build();
        int rows = productMapper.update(update, wrapper);
        if (rows == 0) {
            throw new BusinessException(ResultCode.PRODUCT_INSUFFICIENT_STOCK);
        }
    }
}
