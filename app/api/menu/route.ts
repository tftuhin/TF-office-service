import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Basic token validation
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
      const supabase = await createClient();

      // Query items from Supabase (table is 'items', not 'menu_items')
      const { data: items, error } = await supabase
        .from('items')
        .select('id, name, description, price, is_available')
        .eq('is_available', true)
        .order('name');

      if (error) {
        console.error('Database query error:', error);
        throw error;
      }

      // Transform items for the extension
      const menuItems = (items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price)
      }));

      return NextResponse.json({
        items: menuItems,
        total: menuItems.length
      });
    } catch (dbError) {
      console.error('Supabase error:', dbError);
      // Return empty menu on database error instead of 500
      return NextResponse.json({
        items: [],
        total: 0,
        message: 'Menu temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
