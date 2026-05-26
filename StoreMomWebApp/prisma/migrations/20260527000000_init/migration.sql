-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "fname" VARCHAR(45) NOT NULL,
    "lname" VARCHAR(45) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "productId" SERIAL NOT NULL,
    "productName" VARCHAR(100) NOT NULL,
    "quantityInStock" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "sellPrice" DECIMAL(10,2),
    "volume" VARCHAR(45),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "orders" (
    "orderId" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "profit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "orderdetail" (
    "orderDetailId" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantityOrdered" INTEGER NOT NULL,
    "priceEach" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orderdetail_pkey" PRIMARY KEY ("orderDetailId")
);

-- CreateIndex
CREATE INDEX "customer_fname_lname_idx" ON "customer"("fname", "lname");

-- CreateIndex
CREATE INDEX "product_productName_idx" ON "product"("productName");

-- CreateIndex
CREATE INDEX "orders_orderDate_idx" ON "orders"("orderDate");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE INDEX "orderdetail_orderId_idx" ON "orderdetail"("orderId");

-- CreateIndex
CREATE INDEX "orderdetail_productId_idx" ON "orderdetail"("productId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderdetail" ADD CONSTRAINT "orderdetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderdetail" ADD CONSTRAINT "orderdetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;
