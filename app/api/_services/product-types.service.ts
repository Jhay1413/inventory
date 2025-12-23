import * as dal from "../_dal/product-types.dal"

export async function getProductTypes() {
  return dal.listProductTypes()
}

export async function addProductType(name: string) {
  return dal.createProductType(name)
}
