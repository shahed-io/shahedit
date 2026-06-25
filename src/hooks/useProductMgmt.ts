import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\u0980-\u09FF]+/g, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "");

/* ---------- Categories ---------- */
export const useProductCategories = () =>
  useQuery({
    queryKey: ["product_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

export const useSaveCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id?: string;
      name: string;
      slug?: string;
      parent_id?: string | null;
      description?: string;
      image_url?: string;
      sort_order?: number;
      is_active?: boolean;
    }) => {
      const slug = p.slug?.trim() || slugify(p.name);
      const { id, ...rest } = p;
      const payload = { ...rest, slug };
      if (id) {
        const { error } = await supabase.from("product_categories").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product_categories"] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product_categories"] }),
  });
};

/* ---------- Brands ---------- */
export const useProductBrands = () =>
  useQuery({
    queryKey: ["product_brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_brands").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

export const useSaveBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id?: string;
      name: string;
      slug?: string;
      logo_url?: string;
      description?: string;
      website_url?: string;
      is_active?: boolean;
    }) => {
      const slug = p.slug?.trim() || slugify(p.name);
      const { id, ...rest } = p;
      const payload = { ...rest, slug };
      if (id) {
        const { error } = await supabase.from("product_brands").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_brands").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product_brands"] }),
  });
};

export const useDeleteBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_brands").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product_brands"] }),
  });
};

/* ---------- Tags ---------- */
export const useProductTags = () =>
  useQuery({
    queryKey: ["product_tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_tags").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

export const useSaveTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id?: string; name: string; slug?: string }) => {
      const slug = p.slug?.trim() || slugify(p.name);
      const { id, ...rest } = p;
      const payload = { ...rest, slug };
      if (id) {
        const { error } = await supabase.from("product_tags").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("product_tags").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product_tags"] }),
  });
};

export const useDeleteTag = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product_tags"] }),
  });
};

/* ---------- Digital Files ---------- */
export const useDigitalFiles = (packageId?: string) =>
  useQuery({
    queryKey: ["digital_files", packageId],
    queryFn: async () => {
      let q = supabase.from("digital_files").select("*, package:service_packages(title,slug)").order("created_at", { ascending: false });
      if (packageId) q = q.eq("package_id", packageId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const useUploadDigitalFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { package_id: string; file: File; download_limit?: number; expiry_days?: number; version?: string }) => {
      const path = `${p.package_id}/${Date.now()}-${p.file.name}`;
      const { error: upErr } = await supabase.storage.from("digital-products").upload(path, p.file, { upsert: false });
      if (upErr) throw upErr;
      const { error } = await supabase.from("digital_files").insert({
        package_id: p.package_id,
        storage_path: path,
        file_name: p.file.name,
        file_size_bytes: p.file.size,
        mime_type: p.file.type,
        version: p.version,
        download_limit: p.download_limit ?? 5,
        expiry_days: p.expiry_days ?? 30,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digital_files"] }),
  });
};

export const useDeleteDigitalFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: { id: string; storage_path: string }) => {
      await supabase.storage.from("digital-products").remove([row.storage_path]);
      const { error } = await supabase.from("digital_files").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digital_files"] }),
  });
};

/* ---------- License Keys ---------- */
export const useLicenseKeys = (filter?: { package_id?: string; status?: string }) =>
  useQuery({
    queryKey: ["license_keys", filter],
    queryFn: async () => {
      let q = supabase
        .from("license_keys")
        .select("*, package:service_packages(title,slug)")
        .order("created_at", { ascending: false })
        .limit(500);
      if (filter?.package_id) q = q.eq("package_id", filter.package_id);
      if (filter?.status) q = q.eq("status", filter.status as any);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

export const useBulkInsertLicenseKeys = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { package_id: string; keys: string[] }) => {
      const rows = p.keys
        .map((k) => k.trim())
        .filter(Boolean)
        .map((k) => ({ package_id: p.package_id, key_value: k }));
      if (rows.length === 0) return { inserted: 0 };
      const { error, count } = await supabase.from("license_keys").insert(rows, { count: "exact" });
      if (error) throw error;
      return { inserted: count ?? rows.length };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["license_keys"] }),
  });
};

export const useRevokeLicenseKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("license_keys").update({ status: "revoked" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["license_keys"] }),
  });
};

export const useDeleteLicenseKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("license_keys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["license_keys"] }),
  });
};

/* ---------- My Downloads (user-side) ---------- */
export const useMyDownloads = () =>
  useQuery({
    queryKey: ["my_downloads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_downloads")
        .select("*, package:service_packages(title,slug), file:digital_files(file_name,file_size_bytes), license:license_keys(key_value,status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

/* ---------- Service Packages picker ---------- */
export const useServicePackagesLite = () =>
  useQuery({
    queryKey: ["service_packages_lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_packages")
        .select("id,title,slug,sku,price,is_published,publish_status")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

/* ---------- Bulk product update ---------- */
export const useBulkUpdatePackages = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { ids: string[]; patch: Record<string, any> }) => {
      if (!p.ids.length) return 0;
      const { error } = await supabase.from("service_packages").update(p.patch).in("id", p.ids);
      if (error) throw error;
      return p.ids.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service_packages_lite"] });
      qc.invalidateQueries({ queryKey: ["service_packages"] });
    },
  });
};

/* ---------- Bulk CSV import for service_packages ---------- */
export const useBulkImportPackages = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Array<Record<string, any>>) => {
      if (!rows.length) return { inserted: 0 };
      // Normalize: must have title; auto-slug
      const normalized = rows
        .filter((r) => r.title)
        .map((r) => ({
          title: r.title,
          slug: r.slug || slugify(r.title),
          short_description: r.short_description || null,
          description: r.description || null,
          price: r.price ? Number(r.price) : null,
          original_price: r.original_price ? Number(r.original_price) : null,
          currency: r.currency || "BDT",
          sku: r.sku || null,
          delivery_days: r.delivery_days ? Number(r.delivery_days) : null,
          is_published: r.is_published === undefined ? true : !!r.is_published,
          is_featured: !!r.is_featured,
          publish_status: r.publish_status || "published",
          meta_title: r.meta_title || null,
          meta_description: r.meta_description || null,
          is_digital: !!r.is_digital,
        }));
      const { error, count } = await (supabase.from("service_packages") as any).insert(normalized, { count: "exact" });
      if (error) throw error;
      return { inserted: count ?? normalized.length };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service_packages_lite"] }),
  });
};
