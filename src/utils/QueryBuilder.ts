import { Request } from 'express';

type QueryValue = Request['query'][string];


const numericOperators = ['gt', 'gte', 'lt', 'lte'];

const parseValue = (value: string) => {
  // Check if value has an operator prefix e.g. "gte:100"
  const [prefix, ...rest] = value.split(':');
  
  if (numericOperators.includes(prefix) && rest.length > 0) {
    const parsed = rest.join(':'); // handles values that contain colons e.g. dates
    return { [prefix]: isNaN(Number(parsed)) ? parsed : Number(parsed) };
  }

  return null; // no operator found
};

export const buildWhere = (
  filters: Record<string, QueryValue>,
  allowedFields: string[],
  stringFields: string[]
) => {
  const where: Record<string, unknown> = {};
  const safeFields = Object.keys(filters).filter((key) => allowedFields.includes(key));

  for (const key of safeFields) {

    const value = filters[key];

    if (typeof value !== 'string') continue;

    const operator = parseValue(value);

    if (operator) {
      where[key] = operator
    } else if (stringFields.includes(key)) {
      where[key] = { contains: filters[key], mode: 'insensitive' };
    } else {
      where[key] = filters[key];
    }
  }

  return where;
};

export const buildSelect = (
  fields: QueryValue,
  allowedFields: string[]
) => {
  const defaultSelect: Record<string, boolean> = Object.fromEntries(
    allowedFields.map((key) => [key, true])
  );

  if (!fields) return defaultSelect;

  console.log(fields);
  const selectedFields = typeof fields === 'string' ? fields.split(',') : [];

  const safeFields = selectedFields
    .filter((key) => key !== 'password' && allowedFields.includes(key))
    .map((key) => [key, true]);

  return safeFields.length > 0 ? Object.fromEntries(safeFields) : defaultSelect;
};

export const buildOrderBy = (
  sort: QueryValue,
  allowedFields: string[]
) => {
  if (!sort) return undefined;

  const selectedSorts = typeof sort === 'string' ? sort.split(',') : [];

  const safeSorts = selectedSorts.filter((elem) =>
    allowedFields.includes(elem.startsWith('-') ? elem.substring(1) : elem)
  );

  if (safeSorts.length === 0) return undefined;

  return safeSorts.map((elem) => {
    if (elem.startsWith('-')) return { [elem.substring(1)]: 'desc' };
    return { [elem]: 'asc' };
  });
};

export const buildPagination = (
  page: QueryValue,
  limit: QueryValue
) => {
  const currentPage = Number(page) || 1;
  const take = Number(limit) || 10;
  const skip = (currentPage - 1) * take;

  return { skip, take };
};