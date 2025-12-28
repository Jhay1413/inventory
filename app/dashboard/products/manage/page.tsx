"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useProductTypes } from "@/app/queries/product-types.queries";
import { useProductModelsByProductType } from "@/app/queries/product-models.queries";
import { useCreateProductType } from "@/app/queries/product-types.queries";
import { useCreateProductModel } from "@/app/queries/product-models.queries";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const productTypeSchema = z.object({
  name: z.string().min(1, "Product type name is required"),
});

const productModelSchema = z.object({
  name: z.string().min(1, "Product model name is required"),
  productTypeId: z.string().min(1, "Select a product type first"),
});

export default function ManageProductTypesModelsPage() {
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const { data: productTypesData, isLoading: loadingTypes } = useProductTypes();
  const { data: productModelsData } = useProductModelsByProductType(selectedTypeId);
  const createProductType = useCreateProductType();
  const createProductModel = useCreateProductModel();

  const typeForm = useForm({
    resolver: zodResolver(productTypeSchema),
    defaultValues: { name: "" },
  });

  const modelForm = useForm({
    resolver: zodResolver(productModelSchema),
    defaultValues: { name: "", productTypeId: "" },
  });

  async function onSubmitType(values: { name: string }) {
    await createProductType.mutateAsync({ name: values.name });
    typeForm.reset();
  }

  async function onSubmitModel(values: { name: string; productTypeId: string }) {
    await createProductModel.mutateAsync({ name: values.name, productTypeId: values.productTypeId });
    modelForm.reset({ name: "", productTypeId: values.productTypeId });
  }

  return (
    <div className="w-full mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">Manage Product Types & Models</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Product Type */}
        <Card>
          <CardHeader>
            <CardTitle>Add Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...typeForm}>
              <form onSubmit={typeForm.handleSubmit(onSubmitType)} className="space-y-4">
                <FormField
                  control={typeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Phone, Laptop" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={createProductType.status === "pending"}>
                    Add Type
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Existing Types</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(productTypesData?.productTypes ?? []).map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>{type.name}</TableCell>
                      <TableCell>{new Date(type.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        {/* Add Product Model */}
        <Card>
          <CardHeader>
            <CardTitle>Add Product Model</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...modelForm}>
              <form onSubmit={modelForm.handleSubmit(onSubmitModel)} className="space-y-4">
                <FormField
                  control={modelForm.control}
                  name="productTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setSelectedTypeId(val);
                        }}
                        disabled={loadingTypes}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(productTypesData?.productTypes ?? []).map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={modelForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. iPhone 15 Pro Max" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={createProductModel.status === "pending" || !modelForm.watch("productTypeId")}>
                    Add Model
                  </Button>
                </div>
              </form>
            </Form>
            {selectedTypeId && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Models for Selected Type</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(productModelsData ?? []).map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>{model.name}</TableCell>
                        <TableCell>{new Date(model.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
