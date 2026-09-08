import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oltrxiwdgtevavhbjcdc.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Ibe6qOxJgQZvCSMlYrPVZg_qwgh6TPo';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Map model and relation names to Supabase PascalCase tables
const RELATION_MAP: Record<string, string> = {
  steps: 'ShipmentStep',
  salesOrders: 'SalesOrder',
  orders: 'Order',
  material: 'Material',
  shipment: 'Shipment',
  rfqs: 'RFQRecord',
  quotes: 'QuoteRecord',
  purchaseOrders: 'PurchaseOrderRecord',
  shipments: 'Shipment',
  participants: 'MissionParticipant',
  taskInstances: 'TaskInstance',
};

function getTableName(modelName: string): string {
  if (modelName === 'poRecord') return 'PurchaseOrderRecord';
  if (modelName === 'rfqRecord') return 'RFQRecord';
  return modelName.charAt(0).toUpperCase() + modelName.slice(1);
}

function parseRecord(record: any): any {
  if (!record || typeof record !== 'object') return record;
  if (Array.isArray(record)) return record.map(parseRecord);

  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(record)) {
    if (typeof val === 'string' && (key.endsWith('At') || key === 'createdAt' || key === 'updatedAt')) {
      const d = new Date(val);
      out[key] = isNaN(d.getTime()) ? val : d;
    } else if (typeof val === 'object' && val !== null) {
      out[key] = parseRecord(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

function buildSelectString(include?: Record<string, any>): string {
  if (!include || typeof include !== 'object' || Object.keys(include).length === 0) {
    return '*';
  }

  const parts = ['*'];
  for (const [key, val] of Object.entries(include)) {
    if (!val) continue;
    const targetTable = RELATION_MAP[key] || getTableName(key);
    parts.push(`${key}:${targetTable}(*)`);
  }
  return parts.join(', ');
}

function applyWhereFilters(query: any, where: Record<string, any> | undefined): any {
  if (!where || typeof where !== 'object') return query;

  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;

    if (val === null) {
      query = query.is(key, null);
    } else if (typeof val === 'object' && !Array.isArray(val)) {
      if ('in' in val && Array.isArray(val.in)) {
        query = query.in(key, val.in);
      } else if ('notIn' in val && Array.isArray(val.notIn)) {
        query = query.not(key, 'in', `(${val.notIn.join(',')})`);
      } else if ('not' in val) {
        if (val.not === null) {
          query = query.not(key, 'is', null);
        } else {
          query = query.neq(key, val.not);
        }
      } else if ('gte' in val) {
        query = query.gte(key, val.gte);
      } else if ('lte' in val) {
        query = query.lte(key, val.lte);
      } else if ('gt' in val) {
        query = query.gt(key, val.gt);
      } else if ('lt' in val) {
        query = query.lt(key, val.lt);
      } else if ('contains' in val) {
        query = query.ilike(key, `%${val.contains}%`);
      } else if ('startsWith' in val) {
        query = query.ilike(key, `${val.startsWith}%`);
      } else if ('endsWith' in val) {
        query = query.ilike(key, `%${val.endsWith}`);
      } else if ('equals' in val) {
        query = query.eq(key, val.equals);
      }
    } else {
      query = query.eq(key, val);
    }
  }

  return query;
}

export function createModelDelegate(modelName: string) {
  const tableName = getTableName(modelName);

  return {
    async findMany(args: any = {}) {
      try {
        const selectStr = buildSelectString(args.include);
        let query = supabase.from(tableName).select(selectStr);
        query = applyWhereFilters(query, args.where);

        if (args.orderBy) {
          if (Array.isArray(args.orderBy)) {
            for (const ob of args.orderBy) {
              const [col, dir] = Object.entries(ob)[0];
              query = query.order(col, { ascending: dir === 'asc' });
            }
          } else if (typeof args.orderBy === 'object') {
            const [col, dir] = Object.entries(args.orderBy)[0];
            query = query.order(col, { ascending: dir === 'asc' });
          }
        }

        if (args.take) {
          const from = args.skip || 0;
          const to = from + args.take - 1;
          query = query.range(from, to);
        } else if (args.skip) {
          query = query.range(args.skip, args.skip + 999);
        }

        const { data, error } = await query;
        if (error) {
          if (args.include) {
            const fallback = await supabase.from(tableName).select('*');
            return parseRecord(fallback.data || []);
          }
          console.warn(`[Supabase HTTPS] findMany on ${tableName} notice:`, error.message);
          return [];
        }
        return parseRecord(data || []);
      } catch (err: any) {
        console.error(`[Supabase HTTPS] Error in findMany on ${tableName}:`, err.message);
        return [];
      }
    },

    async findFirst(args: any = {}) {
      const items = await this.findMany({ ...args, take: 1 });
      return items[0] || null;
    },

    async findUnique(args: any = {}) {
      return this.findFirst(args);
    },

    async create(args: any = {}) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(args.data)
          .select()
          .single();

        if (error) {
          console.error(`[Supabase HTTPS] create on ${tableName} error:`, error.message);
          throw new Error(error.message);
        }
        return parseRecord(data);
      } catch (err: any) {
        console.error(`[Supabase HTTPS] create on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async createMany(args: any = {}) {
      try {
        const insertData = Array.isArray(args.data) ? args.data : [args.data];
        const { data, error } = await supabase.from(tableName).insert(insertData).select();
        if (error) {
          console.error(`[Supabase HTTPS] createMany on ${tableName} error:`, error.message);
          throw new Error(error.message);
        }
        return { count: data?.length || insertData.length };
      } catch (err: any) {
        console.error(`[Supabase HTTPS] createMany on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async update(args: any = {}) {
      try {
        let query = supabase.from(tableName).update(args.data);
        query = applyWhereFilters(query, args.where);
        const { data, error } = await query.select().single();
        if (error) {
          console.error(`[Supabase HTTPS] update on ${tableName} error:`, error.message);
          throw new Error(error.message);
        }
        return parseRecord(data);
      } catch (err: any) {
        console.error(`[Supabase HTTPS] update on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async updateMany(args: any = {}) {
      try {
        let query = supabase.from(tableName).update(args.data);
        query = applyWhereFilters(query, args.where);
        const { data, error } = await query.select();
        if (error) {
          console.error(`[Supabase HTTPS] updateMany on ${tableName} error:`, error.message);
          throw new Error(error.message);
        }
        return { count: data?.length || 0 };
      } catch (err: any) {
        console.error(`[Supabase HTTPS] updateMany on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async upsert(args: any = {}) {
      try {
        const existing = await this.findFirst({ where: args.where });
        if (existing) {
          return this.update({ where: args.where, data: args.update });
        } else {
          return this.create({ data: { ...args.where, ...args.create } });
        }
      } catch (err: any) {
        console.error(`[Supabase HTTPS] upsert on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async delete(args: any = {}) {
      try {
        let query = supabase.from(tableName).delete();
        query = applyWhereFilters(query, args.where);
        const { data, error } = await query.select().single();
        if (error) {
          console.error(`[Supabase HTTPS] delete on ${tableName} error:`, error.message);
          throw new Error(error.message);
        }
        return parseRecord(data);
      } catch (err: any) {
        console.error(`[Supabase HTTPS] delete on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async deleteMany(args: any = {}) {
      try {
        let query = supabase.from(tableName).delete();
        query = applyWhereFilters(query, args.where);
        const { data, error } = await query.select();
        if (error) {
          console.error(`[Supabase HTTPS] deleteMany on ${tableName} error:`, error.message);
          throw new Error(error.message);
        }
        return { count: data?.length || 0 };
      } catch (err: any) {
        console.error(`[Supabase HTTPS] deleteMany on ${tableName} exception:`, err.message);
        throw err;
      }
    },

    async count(args: any = {}) {
      try {
        let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
        query = applyWhereFilters(query, args.where);
        const { count, error } = await query;
        if (error) return 0;
        return count || 0;
      } catch (err: any) {
        return 0;
      }
    },
  };
}

export const supabasePrismaProxy: any = new Proxy(
  {},
  {
    get(target, prop: string) {
      if (prop === '$queryRaw' || prop === '$executeRaw') {
        return async () => [];
      }
      if (prop === '$transaction') {
        return async (fnOrArray: any) => {
          if (typeof fnOrArray === 'function') {
            return fnOrArray(supabasePrismaProxy);
          }
          if (Array.isArray(fnOrArray)) {
            return Promise.all(fnOrArray);
          }
          return null;
        };
      }
      return createModelDelegate(prop);
    },
  }
);
