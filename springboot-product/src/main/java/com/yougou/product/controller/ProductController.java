package com.yougou.product.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.yougou.product.common.Result;
import com.yougou.product.common.ResultCode;
import com.yougou.product.dto.CreateProductDTO;
import com.yougou.product.dto.ProductQueryDTO;
import com.yougou.product.dto.UpdateProductDTO;
import com.yougou.product.vo.ProductVO;
import com.yougou.product.service.IProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 商品管理 RESTful 接口
 * <p>
 * 路由规范：
 * - POST   /products/add      新增商品
 * - PUT    /products/update   更新商品
 * - DELETE /products/delete  删除商品
 * - GET    /products/query   分页查询商品
 * - GET    /products/{id}    查询单个商品
 */
@Slf4j
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final IProductService productService;

    // ==================== 1. 新增商品 ====================

    /**
     * POST /products/add
     * 新增商品
     *
     * @param dto 创建参数（@Valid 触发参数校验）
     * @return { code: 200, msg: "操作成功", data: { id: xxx } }
     */
    @PostMapping("/add")
    public Result<Map<String, Long>> createProduct(@Valid @RequestBody CreateProductDTO dto) {
        log.info("[创建商品] name={}, category={}, price={}, stock={}",
                dto.getName(), dto.getCategory(), dto.getPrice(), dto.getStock());

        Long productId = productService.createProduct(dto);

        return Result.success(Map.of("id", productId));
    }

    // ==================== 2. 更新商品 ====================

    /**
     * PUT /products/update
     * 更新商品
     *
     * @param dto 更新参数（@Valid 触发参数校验）
     * @return { code: 200, msg: "操作成功" }
     */
    @PutMapping("/update")
    public Result<Void> updateProduct(@Valid @RequestBody UpdateProductDTO dto) {
        log.info("[更新商品] id={}, name={}, price={}, stock={}",
                dto.getId(), dto.getName(), dto.getPrice(), dto.getStock());

        productService.updateProduct(dto);

        return Result.success();
    }

    // ==================== 3. 删除商品 ====================

    /**
     * DELETE /products/delete
     * 删除商品（单个）
     *
     * @param id 商品 ID（路径参数）
     * @return { code: 200, msg: "操作成功" }
     */
    @DeleteMapping("/delete")
    public Result<Void> deleteProduct(@RequestParam Long id) {
        log.info("[删除商品] id={}", id);

        productService.deleteProduct(id);

        return Result.success();
    }

    /**
     * DELETE /products/delete/batch
     * 批量删除商品
     *
     * @param ids 商品 ID 列表（请求体）
     * @return { code: 200, msg: "操作成功" }
     */
    @DeleteMapping("/delete/batch")
    public Result<Void> deleteProducts(@RequestBody List<Long> ids) {
        log.info("[批量删除商品] ids={}", ids);

        productService.deleteProducts(ids);

        return Result.success();
    }

    // ==================== 4. 查询商品 ====================

    /**
     * GET /products/query
     * 分页查询商品列表
     *
     * @param queryDTO 查询参数（支持 keyword / category / status / current / size / sortBy / sortOrder）
     * @return { code: 200, msg: "操作成功", data: [...], page: { current, size, total, pages } }
     */
    @GetMapping("/query")
    public Result<List<ProductVO>> queryProducts(ProductQueryDTO queryDTO) {
        log.info("[查询商品列表] keyword={}, category={}, status={}, current={}, size={}, sortBy={}",
                queryDTO.getKeyword(), queryDTO.getCategory(), queryDTO.getStatus(),
                queryDTO.getCurrent(), queryDTO.getSize(), queryDTO.getSortBy());

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        // 构建分页信息
        Result.PageInfo pageInfo = new Result.PageInfo(
                page.getCurrent(),
                page.getSize(),
                page.getTotal(),
                page.getPages()
        );

        return Result.success(page.getRecords(), pageInfo);
    }

    /**
     * GET /products/{id}
     * 根据 ID 查询商品详情
     *
     * @param id 商品 ID
     * @return { code: 200, msg: "操作成功", data: {...} }
     */
    @GetMapping("/{id}")
    public Result<ProductVO> getProductById(@PathVariable Long id) {
        log.info("[查询商品详情] id={}", id);

        ProductVO product = productService.getProductById(id);

        return Result.success(product);
    }
}
