import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import { ArrowUpLeft, Home, LayoutDashboard, Loader2, LogOut, Settings2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const menuItems = [{ icon: LayoutDashboard, label: "لوحة الإدارة", path: "/admin" }, { icon: Home, label: "عرض الموقع", path: "/" }];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <AdminLogin />;
  return <SidebarProvider defaultOpen><div dir="rtl" className="flex min-h-screen w-full bg-[#f4f8f6]"><Sidebar side="right" collapsible="icon" className="border-l border-[#dbe8e2] bg-white"><SidebarHeader className="h-20 justify-center border-b border-[#eef4f1]"><div className="flex items-center gap-3 px-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b4d4a] text-sm font-black text-white">ض</div><span className="font-black text-[#103d3b] group-data-[collapsible=icon]:hidden">ضياء موبايل</span></div></SidebarHeader><SidebarContent className="pt-4"><AdminMenu /></SidebarContent><SidebarFooter className="border-t border-[#eef4f1] p-3"><UserMenu /></SidebarFooter></Sidebar><SidebarInset className="min-w-0 bg-[#f4f8f6]"><div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e1ebe6] bg-[#f4f8f6]/90 px-4 backdrop-blur md:px-7"><SidebarTrigger className="rounded-xl" /><div><p className="text-xs font-bold text-[#7b8e88]">لوحة التحكم</p><p className="text-sm font-black text-[#103d3b]">إدارة محتوى الموقع</p></div></div><main className="p-4 md:p-7">{children}</main></SidebarInset></div></SidebarProvider>;
}

function AdminLogin() {
  const { login, loginPending } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); try { await login({ email, password }); } catch { toast.error("بيانات الدخول غير صحيحة أو لم تُضبط إعدادات المدير بعد."); } };
  return <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f4f8f6] p-5"><form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e4f0ea] text-[#0b4d4a]"><Settings2 className="h-6 w-6" /></div><h1 className="mt-6 text-2xl font-black text-[#103d3b]">الدخول إلى لوحة الإدارة</h1><p className="mt-3 leading-7 text-[#69807a]">أدخل بيانات مدير الموقع المضافة في إعدادات الاستضافة.</p><div className="mt-6 space-y-3 text-right"><Input dir="ltr" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /><Input dir="ltr" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="كلمة المرور" /></div><Button disabled={loginPending} type="submit" className="mt-5 h-12 w-full gap-2 rounded-xl bg-[#0b4d4a] font-extrabold text-white hover:bg-[#083d3a]">{loginPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}تسجيل الدخول</Button></form></div>;
}

function AdminMenu() { const [location, setLocation] = useLocation(); return <SidebarMenu className="px-2">{menuItems.map((item) => <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={location === item.path} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl font-bold"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>; }
function UserMenu() { const { user, logout } = useAuth(); return <DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl p-1 text-right hover:bg-[#f0f6f3]"><Avatar className="h-9 w-9"><AvatarFallback className="bg-[#e4f0ea] text-xs font-black text-[#0b4d4a]">{user?.name?.charAt(0) || "م"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-bold text-[#183f3d]">{user?.name || "مدير الموقع"}</p><p className="mt-0.5 truncate text-xs text-[#7b8e88]">مدير</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-48"><div dir="rtl"><DropdownMenuItem onClick={() => window.open("/", "_self")}><ArrowUpLeft className="ml-2 h-4 w-4" />عرض الموقع</DropdownMenuItem><DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive"><LogOut className="ml-2 h-4 w-4" />تسجيل الخروج</DropdownMenuItem></div></DropdownMenuContent></DropdownMenu>; }
