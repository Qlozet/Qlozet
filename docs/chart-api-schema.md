# Dashboard Chart API Schema

A generalized schema for all chart responses that can handle different chart types.

---

## Generic Chart Response Schema

```typescript
interface ChartResponse {
  success: boolean;
  message: string;
  data: {
    chartType: "bar" | "pie" | "stacked_bar" | "line";
    title: string;
    series: ChartSeries[];
    labels?: string[]; // For x-axis or pie labels
  };
}

interface ChartSeries {
  key: string; // Data key (e.g., "earnings", "male", "female")
  name: string; // Display name
  color?: string; // Optional color hint
  data: ChartDataPoint[];
}

interface ChartDataPoint {
  label: string; // X-axis label or category name
  value: number; // Y-axis value
}
```

---

## Simplified Universal Schema (JSON)

```json
{
  "success": true,
  "message": "Chart data retrieved",
  "data": {
    "chartType": "bar | pie | stacked_bar | line",
    "title": "Chart Title",
    "series": [
      {
        "key": "seriesKey",
        "name": "Series Display Name",
        "color": "#3d2817",
        "data": [
          { "label": "Label1", "value": 100 },
          { "label": "Label2", "value": 200 }
        ]
      }
    ]
  }
}
```

---

## Examples Per Chart Type

### Bar Chart (Earnings / Order Count)

```json
{
  "success": true,
  "message": "Earnings retrieved",
  "data": {
    "chartType": "bar",
    "title": "Earnings",
    "series": [
      {
        "key": "earnings",
        "name": "Earnings",
        "color": "#c4b5a0",
        "data": [
          { "label": "Sun", "value": 35000 },
          { "label": "Mon", "value": 39000 },
          { "label": "Tue", "value": 29000 },
          { "label": "Wed", "value": 51000 },
          { "label": "Thu", "value": 39000 },
          { "label": "Fri", "value": 24000 },
          { "label": "Sat", "value": 12000 }
        ]
      }
    ]
  }
}
```

### Pie Chart (Orders by Gender)

```json
{
  "success": true,
  "message": "Gender distribution retrieved",
  "data": {
    "chartType": "pie",
    "title": "Orders by Gender",
    "series": [
      {
        "key": "gender",
        "name": "Gender Distribution",
        "data": [
          { "label": "Male", "value": 65, "color": "#3d2817" },
          { "label": "Female", "value": 35, "color": "#d4c5b9" }
        ]
      }
    ]
  }
}
```

### Stacked Bar Chart (Orders by Location)

```json
{
  "success": true,
  "message": "Top locations retrieved",
  "data": {
    "chartType": "stacked_bar",
    "title": "Orders by Location",
    "series": [
      {
        "key": "male",
        "name": "Male",
        "color": "#3d2817",
        "data": [
          { "label": "KADUNA", "value": 2400 },
          { "label": "ABUJA", "value": 2800 },
          { "label": "LAGOS", "value": 2000 },
          { "label": "JOS", "value": 1800 }
        ]
      },
      {
        "key": "female",
        "name": "Female",
        "color": "#9C8578",
        "data": [
          { "label": "KADUNA", "value": 800 },
          { "label": "ABUJA", "value": 1000 },
          { "label": "LAGOS", "value": 600 },
          { "label": "JOS", "value": 500 }
        ]
      }
    ]
  }
}
```

### Stacked Bar Chart (Orders by Product)

```json
{
  "success": true,
  "message": "Top products retrieved",
  "data": {
    "chartType": "stacked_bar",
    "title": "Orders by Product",
    "series": [
      {
        "key": "male",
        "name": "Male",
        "color": "#3d2817",
        "data": [
          { "label": "AMASI QUEEN DRESS", "value": 50 },
          { "label": "MAISON DE VETEMENTS", "value": 40 },
          { "label": "MOTORSPORT RUNNER", "value": 30 },
          { "label": "WARM CASUAL", "value": 25 }
        ]
      },
      {
        "key": "female",
        "name": "Female",
        "color": "#9C8578",
        "data": [
          { "label": "AMASI QUEEN DRESS", "value": 30 },
          { "label": "MAISON DE VETEMENTS", "value": 25 },
          { "label": "MOTORSPORT RUNNER", "value": 20 },
          { "label": "WARM CASUAL", "value": 15 }
        ]
      }
    ]
  }
}
```

---

## Alternative: Flat Format (Recharts-Friendly)

If the backend prefers a flatter structure that maps directly to Recharts data format:

### TypeScript Definition

```typescript
interface FlatChartResponse {
  success: boolean;
  message: string;
  data: {
    chartType: "bar" | "pie" | "stacked_bar" | "line";
    title: string;
    dataPoints: FlatDataPoint[];
    seriesMeta: SeriesMeta[];
  };
}

interface FlatDataPoint {
  label: string;
  [key: string]: string | number; // Dynamic keys for values
}

interface SeriesMeta {
  key: string;
  name: string;
  color: string;
}
```

### JSON Example

```json
{
  "success": true,
  "message": "Top locations retrieved",
  "data": {
    "chartType": "stacked_bar",
    "title": "Orders by Location",
    "dataPoints": [
      { "label": "KADUNA", "male": 2400, "female": 800 },
      { "label": "ABUJA", "male": 2800, "female": 1000 },
      { "label": "LAGOS", "male": 2000, "female": 600 },
      { "label": "JOS", "male": 1800, "female": 500 }
    ],
    "seriesMeta": [
      { "key": "male", "name": "Male", "color": "#3d2817" },
      { "key": "female", "name": "Female", "color": "#9C8578" }
    ]
  }
}
```

---

## Stats Cards Schema

For the dashboard stats cards, use a separate schema:

```typescript
interface StatsResponse {
  success: boolean;
  message: string;
  data: {
    totalOrders: number;
    totalOrdersChange: string;
    totalEarnings: number;
    totalEarningsChange: string;
    averageOrdersPerDay: number;
    averageOrdersChange: string;
    totalReturns: number;
    totalReturnsChange: string;
  };
}
```

```json
{
  "success": true,
  "message": "Dashboard stats retrieved",
  "data": {
    "totalOrders": 1000,
    "totalOrdersChange": "+24%",
    "totalEarnings": 50000,
    "totalEarningsChange": "+2.5%",
    "averageOrdersPerDay": 900,
    "averageOrdersChange": "+2.5%",
    "totalReturns": 10,
    "totalReturnsChange": "-2.6%"
  }
}
```

---

## Recent Orders Schema

```typescript
interface RecentOrdersResponse {
  success: boolean;
  message: string;
  data: RecentOrderItem[];
}

interface RecentOrderItem {
  id: number;
  orderId: string;
  customerName: string;
  amount: number;
  date: string; // ISO date format (YYYY-MM-DD)
  productImage: string; // URL
}
```

```json
{
  "success": true,
  "message": "Recent orders retrieved",
  "data": [
    {
      "id": 1,
      "orderId": "D34554ADF",
      "customerName": "Omowyi Precious",
      "amount": 20000,
      "date": "2023-03-23",
      "productImage": "https://example.com/image.jpg"
    }
  ]
}
```

---

## Notes

- The **series format** is more explicit and self-documenting
- The **flat format** is easier to work with in Recharts since it matches the library's expected data structure directly
- All monetary values should be in the smallest currency unit (kobo) or as plain numbers
- Dates should use ISO 8601 format (YYYY-MM-DD)
- Percentage changes should include the sign (+/-) as a string
