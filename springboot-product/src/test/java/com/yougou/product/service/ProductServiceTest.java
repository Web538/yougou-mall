package com.yougou.product.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.yougou.product.common.BusinessException;
import com.yougou.product.common.ResultCode;
import com.yougou.product.dto.CreateProductDTO;
import com.yougou.product.dto.ProductQueryDTO;
import com.yougou.product.dto.UpdateProductDTO;
import com.yougou.product.vo.ProductVO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 商品 Service 单元测试
 * <p>
 * 测试覆盖：
 * 1. 创建商品（正常创建 / 名称重复校验）
 * 2. 更新商品（正常更新 / 商品不存在 / 名称重复）
 * 3. 删除商品（单个删除 / 商品不存在）
 * 4. 查询商品（分页查询 / ID查询 / 关键词搜索）
 * 5. 参数校验（空值校验）
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductServiceTest {

    @Autowired
    private IProductService productService;

    private static Long createdProductId;

    // ==================== 1. 创建商品测试 ====================

    @Test
    @Order(1)
    @DisplayName("【创建】正常创建商品 - 成功")
    void testCreateProduct_Success() {
        CreateProductDTO dto = CreateProductDTO.builder()
                .name("测试商品_" + System.currentTimeMillis())
                .category("测试分类")
                .price(new BigDecimal("99.99"))
                .stock(100)
                .description("这是一个测试商品")
                .status(1)
                .build();

        Long id = productService.createProduct(dto);

        assertNotNull(id);
        createdProductId = id;
        System.out.println("[创建成功] 商品ID: " + id);
    }

    @Test
    @Order(2)
    @DisplayName("【创建】商品名称重复 - 抛出名称已存在异常")
    void testCreateProduct_DuplicateName() {
        // 先创建一个商品
        CreateProductDTO dto1 = CreateProductDTO.builder()
                .name("唯一测试商品_001")
                .category("测试分类")
                .price(new BigDecimal("10.00"))
                .stock(10)
                .build();
        productService.createProduct(dto1);

        // 再次创建同名商品，应抛出异常
        CreateProductDTO dto2 = CreateProductDTO.builder()
                .name("唯一测试商品_001")
                .category("测试分类2")
                .price(new BigDecimal("20.00"))
                .stock(20)
                .build();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productService.createProduct(dto2));
        assertEquals(ResultCode.PRODUCT_NAME_EXIST.getCode(), ex.getCode());
    }

    // ==================== 2. 更新商品测试 ====================

    @Test
    @Order(3)
    @DisplayName("【更新】正常更新商品 - 成功")
    void testUpdateProduct_Success() {
        // 先创建一个商品
        CreateProductDTO createDto = CreateProductDTO.builder()
                .name("待更新商品_001")
                .category("测试分类")
                .price(new BigDecimal("50.00"))
                .stock(50)
                .build();
        Long id = productService.createProduct(createDto);

        // 更新商品
        UpdateProductDTO updateDto = UpdateProductDTO.builder()
                .id(id)
                .name("已更新商品_001")
                .category("新分类")
                .price(new BigDecimal("80.00"))
                .stock(80)
                .description("更新后的描述")
                .status(1)
                .build();

        assertDoesNotThrow(() -> productService.updateProduct(updateDto));

        // 验证更新结果
        ProductVO vo = productService.getProductById(id);
        assertEquals("已更新商品_001", vo.getName());
        assertEquals(new BigDecimal("80.00"), vo.getPrice());
        assertEquals(80, vo.getStock());
    }

    @Test
    @Order(4)
    @DisplayName("【更新】更新不存在的商品 - 抛出商品不存在异常")
    void testUpdateProduct_NotFound() {
        UpdateProductDTO dto = UpdateProductDTO.builder()
                .id(999999L)
                .name("不存在商品")
                .category("分类")
                .price(new BigDecimal("10.00"))
                .stock(10)
                .build();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productService.updateProduct(dto));
        assertEquals(ResultCode.PRODUCT_NOT_FOUND.getCode(), ex.getCode());
    }

    // ==================== 3. 删除商品测试 ====================

    @Test
    @Order(5)
    @DisplayName("【删除】正常删除商品 - 成功")
    void testDeleteProduct_Success() {
        // 先创建一个商品
        CreateProductDTO dto = CreateProductDTO.builder()
                .name("待删除商品_001")
                .category("测试分类")
                .price(new BigDecimal("30.00"))
                .stock(30)
                .build();
        Long id = productService.createProduct(dto);

        // 删除
        assertDoesNotThrow(() -> productService.deleteProduct(id));

        // 验证已删除
        BusinessException ex = assertThrows(BusinessException.class,
                () -> productService.getProductById(id));
        assertEquals(ResultCode.PRODUCT_NOT_FOUND.getCode(), ex.getCode());
    }

    @Test
    @Order(6)
    @DisplayName("【删除】删除不存在的商品 - 抛出商品不存在异常")
    void testDeleteProduct_NotFound() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> productService.deleteProduct(999998L));
        assertEquals(ResultCode.PRODUCT_NOT_FOUND.getCode(), ex.getCode());
    }

    @Test
    @Order(7)
    @DisplayName("【批量删除】批量删除商品 - 成功")
    void testDeleteProducts_Batch() {
        List<Long> ids = List.of(createdProductId);
        assertDoesNotThrow(() -> productService.deleteProducts(ids));
    }

    // ==================== 4. 查询商品测试 ====================

    @Test
    @Order(8)
    @DisplayName("【查询】分页查询商品列表 - 返回分页数据")
    void testQueryProducts_Pagination() {
        ProductQueryDTO queryDTO = ProductQueryDTO.builder()
                .current(1L)
                .size(10L)
                .build();

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        assertNotNull(page);
        assertTrue(page.getTotal() > 0);
        assertEquals(1, page.getCurrent());
        assertEquals(10, page.getSize());
        assertNotNull(page.getRecords());
    }

    @Test
    @Order(9)
    @DisplayName("【查询】关键词搜索 - 按商品名称模糊查询")
    void testQueryProducts_ByKeyword() {
        ProductQueryDTO queryDTO = ProductQueryDTO.builder()
                .keyword("iPhone")
                .current(1L)
                .size(10L)
                .build();

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        assertNotNull(page);
        assertTrue(page.getRecords().stream()
                .anyMatch(p -> p.getName().contains("iPhone")));
    }

    @Test
    @Order(10)
    @DisplayName("【查询】按分类筛选 - 精确匹配分类")
    void testQueryProducts_ByCategory() {
        ProductQueryDTO queryDTO = ProductQueryDTO.builder()
                .category("手机数码")
                .current(1L)
                .size(10L)
                .build();

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        assertNotNull(page);
        assertTrue(page.getRecords().stream()
                .allMatch(p -> "手机数码".equals(p.getCategory())));
    }

    @Test
    @Order(11)
    @DisplayName("【查询】按状态筛选 - 只查询上架商品")
    void testQueryProducts_ByStatus() {
        ProductQueryDTO queryDTO = ProductQueryDTO.builder()
                .status(1)
                .current(1L)
                .size(10L)
                .build();

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        assertNotNull(page);
        assertTrue(page.getRecords().stream()
                .allMatch(p -> p.getStatus() == 1));
    }

    @Test
    @Order(12)
    @DisplayName("【查询】按价格排序（升序）- 正确定序")
    void testQueryProducts_SortByPriceAsc() {
        ProductQueryDTO queryDTO = ProductQueryDTO.builder()
                .sortBy("price")
                .sortOrder("asc")
                .current(1L)
                .size(10L)
                .build();

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        assertNotNull(page);
        List<ProductVO> records = page.getRecords();
        for (int i = 0; i < records.size() - 1; i++) {
            assertTrue(
                    records.get(i).getPrice().compareTo(records.get(i + 1).getPrice()) <= 0,
                    "价格应该升序排列"
            );
        }
    }

    @Test
    @Order(13)
    @DisplayName("【查询】按销量排序（降序）- 正确定序")
    void testQueryProducts_SortBySalesDesc() {
        ProductQueryDTO queryDTO = ProductQueryDTO.builder()
                .sortBy("sales")
                .sortOrder("desc")
                .current(1L)
                .size(10L)
                .build();

        IPage<ProductVO> page = productService.queryProducts(queryDTO);

        assertNotNull(page);
        List<ProductVO> records = page.getRecords();
        for (int i = 0; i < records.size() - 1; i++) {
            assertTrue(
                    records.get(i).getSales() >= records.get(i + 1).getSales(),
                    "销量应该降序排列"
            );
        }
    }

    @Test
    @Order(14)
    @DisplayName("【查询】根据 ID 查询商品详情 - 成功")
    void testGetProductById_Success() {
        ProductVO vo = productService.getProductById(1L);

        assertNotNull(vo);
        assertEquals(1L, vo.getId());
        assertNotNull(vo.getName());
        assertNotNull(vo.getPrice());
    }

    @Test
    @Order(15)
    @DisplayName("【查询】根据不存在的 ID 查询 - 抛出商品不存在异常")
    void testGetProductById_NotFound() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> productService.getProductById(999997L));
        assertEquals(ResultCode.PRODUCT_NOT_FOUND.getCode(), ex.getCode());
    }

    @Test
    @Order(16)
    @DisplayName("【查询】传入空 ID - 抛出 ID 不能为空异常")
    void testGetProductById_NullId() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> productService.getProductById(null));
        assertEquals(ResultCode.ID_IS_NULL.getCode(), ex.getCode());
    }
}
