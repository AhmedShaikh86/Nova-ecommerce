"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormError } from "@/components/states";
import { useToast } from "@/components/toast";
import { api, errorMessage } from "@/lib/api";
import { capitalize } from "@/lib/format";
import { CATEGORIES, type Product, type Spec } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const [specs, setSpecs] = useState<Spec[]>(product?.specs ?? []);

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      product
        ? api<{ product: Product }>(`/admin/products/${product._id}`, { method: "PATCH", body })
        : api<{ product: Product }>("/admin/products", { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
      toast(product ? "Product updated" : "Product created");
      router.push("/admin/products");
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const compareAt = String(fd.get("compareAtPrice") ?? "").trim();
    save.mutate({
      name: fd.get("name"),
      brand: fd.get("brand"),
      category: fd.get("category"),
      description: fd.get("description"),
      price: Number(fd.get("price")),
      compareAtPrice: compareAt ? Number(compareAt) : null,
      stock: Number(fd.get("stock")),
      featured: fd.get("featured") === "on",
      images: String(fd.get("images") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
    });
  };

  const updateSpec = (i: number, key: keyof Spec, value: string) =>
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card space-y-4 p-6">
        <Field label="Name" name="name" defaultValue={product?.name} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" name="brand" defaultValue={product?.brand} required />
          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select id="category" name="category" defaultValue={product?.category ?? "laptops"} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {capitalize(c)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            minLength={10}
            defaultValue={product?.description}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="images" className="label">
            Image URLs <span className="font-normal text-muted">(one per line, optional)</span>
          </label>
          <textarea
            id="images"
            name="images"
            rows={3}
            defaultValue={product?.images.join("\n")}
            placeholder="https://…"
            className="input font-mono text-xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="label mb-0">Specifications</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])}
            >
              + Add spec
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.label}
                  onChange={(e) => updateSpec(i, "label", e.target.value)}
                  placeholder="Label"
                  className="input h-10"
                  aria-label={`Spec ${i + 1} label`}
                />
                <input
                  value={s.value}
                  onChange={(e) => updateSpec(i, "value", e.target.value)}
                  placeholder="Value"
                  className="input h-10"
                  aria-label={`Spec ${i + 1} value`}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm shrink-0 text-danger"
                  onClick={() => setSpecs((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label={`Remove spec ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
            {specs.length === 0 && <p className="text-sm text-muted">No specifications added.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-4 p-6">
          <Field label="Price ($)" name="price" type="number" step="0.01" min="0" defaultValue={product?.price} required />
          <Field
            label="Compare-at price ($)"
            name="compareAtPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.compareAtPrice}
          />
          <Field label="Stock" name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? 0} required />
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Featured on homepage
          </label>
        </div>
        <FormError message={save.isError ? errorMessage(save.error) : null} />
        <button type="submit" className="btn btn-primary w-full" disabled={save.isPending}>
          {save.isPending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input id={name} name={name} className="input" {...props} />
    </div>
  );
}
