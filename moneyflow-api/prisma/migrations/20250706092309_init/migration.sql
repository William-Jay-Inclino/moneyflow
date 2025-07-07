-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "registered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_defaults" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "category_defaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_expense_categories" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_income_categories" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_income_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_expenses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" INTEGER NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "user_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_income" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "user_income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_registered_at_idx" ON "users"("registered_at");

-- CreateIndex
CREATE INDEX "user_expense_categories_user_id_idx" ON "user_expense_categories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_expense_categories_user_id_name_key" ON "user_expense_categories"("user_id", "name");

-- CreateIndex
CREATE INDEX "user_income_categories_user_id_idx" ON "user_income_categories"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_income_categories_user_id_name_key" ON "user_income_categories"("user_id", "name");

-- CreateIndex
CREATE INDEX "user_expenses_user_id_idx" ON "user_expenses"("user_id");

-- CreateIndex
CREATE INDEX "user_expenses_user_id_created_at_idx" ON "user_expenses"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_expenses_category_id_idx" ON "user_expenses"("category_id");

-- CreateIndex
CREATE INDEX "user_expenses_created_at_idx" ON "user_expenses"("created_at");

-- CreateIndex
CREATE INDEX "user_expenses_cost_idx" ON "user_expenses"("cost");

-- CreateIndex
CREATE INDEX "user_income_user_id_idx" ON "user_income"("user_id");

-- CreateIndex
CREATE INDEX "user_income_user_id_created_at_idx" ON "user_income"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "user_income_category_id_idx" ON "user_income"("category_id");

-- CreateIndex
CREATE INDEX "user_income_created_at_idx" ON "user_income"("created_at");

-- CreateIndex
CREATE INDEX "user_income_amount_idx" ON "user_income"("amount");

-- AddForeignKey
ALTER TABLE "user_expense_categories" ADD CONSTRAINT "user_expense_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income_categories" ADD CONSTRAINT "user_income_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_expenses" ADD CONSTRAINT "user_expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_expenses" ADD CONSTRAINT "user_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "user_expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income" ADD CONSTRAINT "user_income_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_income" ADD CONSTRAINT "user_income_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "user_income_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
