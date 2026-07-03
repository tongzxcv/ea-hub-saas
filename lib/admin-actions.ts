'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')
  return { supabase, user }
}

export async function updateFileStatus(fileId: string, status: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from('files')
    .update({ status })
    .eq('id', fileId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteFile(fileId: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('files').delete().eq('id', fileId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

export async function updateUserRole(userId: string, role: string) {
  const { supabase, user } = await requireAdmin()
  if (userId === user.id) return { error: 'You cannot change your own role.' }
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function resolveReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
