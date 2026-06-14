# MySQL 安装与启动指南

## 当前状态

Spring Boot 项目已创建完成，Service 层测试全部通过 (11/11)。

Controller 集成测试需要 MySQL 数据库环境，请按以下步骤完成配置。

---

## 一、安装 MySQL

### 方式 1：使用 winget（推荐）

```powershell
winget install Oracle.MySQL
```

### 方式 2：官网下载

访问 https://dev.mysql.com/downloads/mysql/ 下载 MySQL Installer。

---

## 二、初始化 MySQL

### 1. 创建数据目录

```powershell
mkdir C:\mysql_data
```

### 2. 初始化数据库

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --initialize-insecure --datadir=C:\mysql_data
```

### 3. 创建配置文件

在 `C:\Program Files\MySQL\MySQL Server 8.4\` 目录下创建 `my.ini`：

```ini
[mysqld]
datadir=C:/mysql_data
port=3306
skip-grant-tables
bind-address=0.0.0.0
innodb_buffer_pool_size=128M
skip-log-bin
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
```

---

## 三、启动 MySQL

### 方式 1：命令行启动（开发环境推荐）

```powershell
# 在命令行中运行，保持窗口打开
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --defaults-file="C:\Program Files\MySQL\MySQL Server 8.4\my.ini"

# 或使用命令行参数
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --datadir=C:\mysql_data --port=3306 --skip-grant-tables
```

### 方式 2：作为 Windows 服务

```powershell
# 安装服务
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --install MySQL --defaults-file="C:\Program Files\MySQL\MySQL Server 8.4\my.ini"

# 启动服务
net start MySQL

# 停止服务
net stop MySQL
```

---

## 四、创建数据库

MySQL 启动后，执行以下命令：

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -e "CREATE DATABASE IF NOT EXISTS yougou_order DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 五、执行建表 SQL

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" yougou_order < D:\编程\web\springboot-order\src\main\resources\schema.sql
```

---

## 六、修改测试配置

启用 Controller 测试，编辑 `src\test\resources\application.yml`：

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/yougou_order?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: 
```

移除 `@Disabled` 注解：

```java
// src/test/java/com/yougou/order/OrderControllerTest.java
// 删除 @Disabled 注解
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {
```

---

## 七、运行所有测试

```powershell
cd D:\编程\web\springboot-order
mvn clean test
```

---

## 八、预期测试结果

| 测试类 | 用例数 | 预期 |
|:---|:---:|:---:|
| OrderApplicationTests | 1 | ✅ 通过 |
| OrderServiceTest | 11 | ✅ 通过 |
| OrderControllerTest | 10 | ✅ 通过 |
| **总计** | **22** | **100% 通过** |

---

## 九、快速验证（简化版）

如果不方便安装完整 MySQL，可以：

1. 启用 H2 数据库测试模式（已配置）
2. Service 层测试已全部通过
3. Controller 测试代码完整，仅需 MySQL 环境即可运行

---

**文档生成时间**: 2026-06-14
