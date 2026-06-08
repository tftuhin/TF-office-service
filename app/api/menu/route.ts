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

    // Verify token with Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get menu items from database
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, category')
      .eq('active', true)
      .order('category, name');

    if (error) {
      console.error('Menu query error:', error);
      return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
    }

    return NextResponse.json({
      items: menuItems || [],
      total: menuItems?.length || 0
    });
  } catch (error) {
    console.error('Menu API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
