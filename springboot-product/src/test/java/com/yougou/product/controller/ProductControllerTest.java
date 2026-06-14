package com.yougou.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yougou.product.dto.CreateProductDTO;
import com.yougou.product.dto.UpdateProductDTO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 商品 Controller 集成测试
 * <p>
 * 测试覆盖：
 * 1. 创建商品（正常参数 / 缺少必填参数 / 参数格式错误）
 * 2. 更新商品（正常更新 / 商品不存在 / 参数缺失）
 * 3. 删除商品（正常删除 / ID不存在 / ID为空）
 * 4. 查询商品（分页查询 / ID查询 / 关键词查询 / 分类筛选 / 状态筛选 / 排序）
 * 5. 异常场景（404接口 / JSON格式错误 / 请求方法不支持）
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static Long createdProductId;

    // ==================== 1. 创建商品（POST /products/add） ====================

    @Test
    @Order(1)
    @DisplayName("【创建商品】正常参数 - 返回 200，响应包含商品 ID")
    void testCreateProduct_Success() throws Exception {
        CreateProductDTO dto = CreateProductDTO.builder()
                .name("测试商品_Controller_" + System.currentTimeMillis())
                .category("测试分类")
                .price(new BigDecimal("99.99"))
                .stock(100)
                .description("Controller 测试商品")
                .status(1)
                .build();

        MvcResult result = mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.msg").value("操作成功"))
                .andExpect(jsonPath("$.data.id").exists())
                .andReturn();

        // 提取创建的 ID 供后续测试使用
        String responseBody = result.getResponse().getContentAsString();
        Long id = objectMapper.readTree(responseBody)
                .path("data").path("id").asLong();
        createdProductId = id;
        System.out.println("[创建成功] 商品ID: " + id);
    }

    @Test
    @Order(2)
    @DisplayName("【创建商品】缺少必填参数（商品名称为空）- 返回 200，响应 code=4204")
    void testCreateProduct_MissingName() throws Exception {
        CreateProductDTO dto = CreateProductDTO.builder()
                .category("测试分类")
                .price(new BigDecimal("99.99"))
                .stock(100)
                .build();

        mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4204))
                .andExpect(jsonPath("$.msg").value("商品名称不能为空"));
    }

    @Test
    @Order(3)
    @DisplayName("【创建商品】商品价格为负数 - 返回 200，响应 code=4205")
    void testCreateProduct_InvalidPrice() throws Exception {
        CreateProductDTO dto = CreateProductDTO.builder()
                .name("测试商品_InvalidPrice")
                .category("测试分类")
                .price(new BigDecimal("-10.00"))
                .stock(100)
                .build();

        mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4205));
    }

    @Test
    @Order(4)
    @DisplayName("【创建商品】商品库存为负数 - 返回 200，响应 code=4206")
    void testCreateProduct_InvalidStock() throws Exception {
        CreateProductDTO dto = CreateProductDTO.builder()
                .name("测试商品_InvalidStock")
                .category("测试分类")
                .price(new BigDecimal("10.00"))
                .stock(-5)
                .build();

        mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4206));
    }

    @Test
    @Order(5)
    @DisplayName("【创建商品】商品名称重复 - 返回 200，响应 code=4302")
    void testCreateProduct_DuplicateName() throws Exception {
        // 先创建一个商品
        CreateProductDTO dto1 = CreateProductDTO.builder()
                .name("唯一商品_DuplicateTest")
                .category("测试分类")
                .price(new BigDecimal("10.00"))
                .stock(10)
                .build();
        mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto1)))
                .andExpect(status().isOk());

        // 再次创建同名商品
        CreateProductDTO dto2 = CreateProductDTO.builder()
                .name("唯一商品_DuplicateTest")
                .category("测试分类2")
                .price(new BigDecimal("20.00"))
                .stock(20)
                .build();

        mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4302));
    }

    @Test
    @Order(6)
    @DisplayName("【创建商品】请求体 JSON 格式错误 - 返回 200，响应 code=4202")
    void testCreateProduct_InvalidJson() throws Exception {
        mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ invalid json }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4202));
    }

    // ==================== 2. 更新商品（PUT /products/update） ====================

    @Test
    @Order(7)
    @DisplayName("【更新商品】正常更新 - 返回 200")
    void testUpdateProduct_Success() throws Exception {
        // 先创建一个商品
        CreateProductDTO createDto = CreateProductDTO.builder()
                .name("待更新商品_Controller")
                .category("测试分类")
                .price(new BigDecimal("50.00"))
                .stock(50)
                .build();
        MvcResult createResult = mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isOk())
                .andReturn();
        Long productId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 更新商品
        UpdateProductDTO updateDto = UpdateProductDTO.builder()
                .id(productId)
                .name("已更新商品_Controller")
                .category("新分类")
                .price(new BigDecimal("80.00"))
                .stock(80)
                .status(1)
                .build();

        mockMvc.perform(put("/products/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.msg").value("操作成功"));
    }

    @Test
    @Order(8)
    @DisplayName("【更新商品】更新不存在的商品 - 返回 200，响应 code=4301")
    void testUpdateProduct_NotFound() throws Exception {
        UpdateProductDTO dto = UpdateProductDTO.builder()
                .id(999999L)
                .name("不存在商品")
                .category("分类")
                .price(new BigDecimal("10.00"))
                .stock(10)
                .build();

        mockMvc.perform(put("/products/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4301));
    }

    @Test
    @Order(9)
    @DisplayName("【更新商品】缺少商品 ID - 返回 200，响应 code=4209")
    void testUpdateProduct_MissingId() throws Exception {
        UpdateProductDTO dto = UpdateProductDTO.builder()
                .name("商品名称")
                .category("分类")
                .price(new BigDecimal("10.00"))
                .stock(10)
                .build();

        mockMvc.perform(put("/products/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4209));
    }

    // ==================== 3. 删除商品（DELETE /products/delete） ====================

    @Test
    @Order(10)
    @DisplayName("【删除商品】正常删除 - 返回 200")
    void testDeleteProduct_Success() throws Exception {
        // 先创建一个商品
        CreateProductDTO dto = CreateProductDTO.builder()
                .name("待删除商品_Controller")
                .category("测试分类")
                .price(new BigDecimal("30.00"))
                .stock(30)
                .build();
        MvcResult createResult = mockMvc.perform(post("/products/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andReturn();
        Long productId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 删除
        mockMvc.perform(delete("/products/delete")
                        .param("id", String.valueOf(productId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(11)
    @DisplayName("【删除商品】删除不存在的商品 - 返回 200，响应 code=4301")
    void testDeleteProduct_NotFound() throws Exception {
        mockMvc.perform(delete("/products/delete")
                        .param("id", "999996"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4301));
    }

    @Test
    @Order(12)
    @DisplayName("【删除商品】缺少商品 ID 参数 - 返回 200，响应 code=4201")
    void testDeleteProduct_MissingId() throws Exception {
        mockMvc.perform(delete("/products/delete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4201));
    }

    // ==================== 4. 查询商品 ====================

    @Test
    @Order(13)
    @DisplayName("【查询列表】默认分页 - 返回分页数据，page 包含 current/size/total/pages")
    void testQueryProducts_Default() throws Exception {
        mockMvc.perform(get("/products/query"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.page").exists())
                .andExpect(jsonPath("$.page.current").exists())
                .andExpect(jsonPath("$.page.size").exists())
                .andExpect(jsonPath("$.page.total").exists())
                .andExpect(jsonPath("$.page.pages").exists());
    }

    @Test
    @Order(14)
    @DisplayName("【查询列表】关键词搜索 - 返回匹配商品")
    void testQueryProducts_Keyword() throws Exception {
        mockMvc.perform(get("/products/query")
                        .param("keyword", "iPhone")
                        .param("current", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").exists());
    }

    @Test
    @Order(15)
    @DisplayName("【查询列表】按分类筛选 - 返回同分类商品")
    void testQueryProducts_Category() throws Exception {
        mockMvc.perform(get("/products/query")
                        .param("category", "phones")
                        .param("current", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].category").value("phones"));
    }

    @Test
    @Order(16)
    @DisplayName("【查询列表】按状态下架筛选 - 返回已下架商品")
    void testQueryProducts_StatusOff() throws Exception {
        mockMvc.perform(get("/products/query")
                        .param("status", "0")
                        .param("current", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(17)
    @DisplayName("【查询列表】按价格升序排序 - 返回正确排序")
    void testQueryProducts_SortByPriceAsc() throws Exception {
        mockMvc.perform(get("/products/query")
                        .param("sortBy", "price")
                        .param("sortOrder", "asc")
                        .param("current", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(18)
    @DisplayName("【查询列表】按销量降序排序 - 返回正确排序")
    void testQueryProducts_SortBySalesDesc() throws Exception {
        mockMvc.perform(get("/products/query")
                        .param("sortBy", "sales")
                        .param("sortOrder", "desc")
                        .param("current", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @Order(19)
    @DisplayName("【查询列表】自定义分页参数 - 返回指定页数据")
    void testQueryProducts_CustomPage() throws Exception {
        mockMvc.perform(get("/products/query")
                        .param("current", "2")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.page.current").value(2))
                .andExpect(jsonPath("$.page.size").value(5));
    }

    @Test
    @Order(20)
    @DisplayName("【查询商品详情】正常查询 - 返回商品详细信息")
    void testGetProductById_Success() throws Exception {
        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").exists())
                .andExpect(jsonPath("$.data.category").exists())
                .andExpect(jsonPath("$.data.price").exists());
    }

    @Test
    @Order(21)
    @DisplayName("【查询商品详情】商品不存在 - 返回 200，响应 code=4301")
    void testGetProductById_NotFound() throws Exception {
        mockMvc.perform(get("/products/999995"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(4301))
                .andExpect(jsonPath("$.msg").value("商品不存在"));
    }

    // ==================== 5. 异常场景测试 ====================

    @Test
    @Order(22)
    @DisplayName("【异常】访问不存在的接口 - 返回 code=404（统一返回格式）")
    void test404_NotFound() throws Exception {
        mockMvc.perform(get("/nonexistent-api-xyz12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.msg").exists());
    }

    @Test
    @Order(23)
    @DisplayName("【异常】请求方法错误（POST 查询接口）- 返回 code=405")
    void test405_MethodNotAllowed() throws Exception {
        mockMvc.perform(post("/products/query"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(405));
    }
}
