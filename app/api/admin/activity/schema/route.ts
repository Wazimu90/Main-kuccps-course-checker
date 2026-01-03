import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabaseServer"

export async function GET() {
  // Inspect activity_logs table structure
  const { data, error } = await supabaseServer
    .from("activity_logs")
    .select("*")
    .limit(1)
  // Also query information_schema for columns
  const { data: cols, error: colsErr } = await supabaseServer.rpc("get_table_columns", {
    p_table_name: "activity_logs",
  })
  return NextResponse.json({
    sample: error ? null : data,
    columns: colsErr ? null : cols,
    note:
      "If 'columns' is null, create a Postgres function get_table_columns(name) to introspect information_schema.columns.",
  })
}
