import React, { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, usePage, router, Link } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import EditTodoModal from "@/Components/EditTodoModal";

// --- START: KOMPONEN PAGINATION YANG DIPERBAIKI ---
function Pagination({ links, currentPage, lastPage }) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            {links.map((link, index) => {
                let label = link.label;

                if (link.label.includes('...')) {
                    return (
                        <span key={index} className="text-muted-foreground px-3 py-1">
                            ...
                        </span>
                    );
                }
                
                // PERBAIKAN: Mengecek kunci terjemahan mentah (huruf kecil) ATAU teks default Laravel
                if (link.label.includes('Previous') || link.label === 'pagination.previous') {
                    label = 'Previous'; 
                } 
                else if (link.label.includes('Next') || link.label === 'pagination.next') {
                    label = 'Next'; 
                }
                
                const isActive = link.active;
                const isPreviousOrNextDisabled = !link.url && !link.active;

                if (isPreviousOrNextDisabled) {
                    return (
                        <span 
                            key={index} 
                            className="px-3 py-1 text-muted-foreground opacity-50 cursor-not-allowed rounded-md"
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveState 
                        className={`inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground pointer-events-none' : 'bg-background hover:bg-muted text-foreground border border-input'}`}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
// --- END: KOMPONEN PAGINATION YANG DIPERBAIKI ---


export default function HomePage() {
    // Destructure `filters` dari props
    const { auth, todos, filters } = usePage().props; 
    
    // State untuk modal "Create" (Buat)
    const [isCreateOpen, setIsCreateOpen] = useState(false); 
    
    // State baru untuk modal "Edit"
    const [editingTodo, setEditingTodo] = useState(null);

    // State baru untuk modal "Delete"
    const [deletingTodo, setDeletingTodo] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State untuk Search dan Filter BARU
    const [search, setSearch] = useState(filters.search || ""); 
    const [filter, setFilter] = useState(filters.filter || "all"); 

    // Handler untuk Filter: HARUS MENGGUNAKAN `replace: true` AGAN QUERY STRING BARU MENGGANTIKAN YANG LAMA
    const handleFilterChange = (event) => {
        const newFilter = event.target.value;
        setFilter(newFilter);
        const url = (typeof route === 'function') ? route("home") : '/';
        router.get(
            url, 
            { search: search, filter: newFilter }, 
            // Pertahankan scroll dan ganti history state
            { preserveState: true, replace: true } 
        );
    };

    // Handler untuk Search:
    const handleSearchChange = (event) => {
        const newSearch = event.target.value;
        setSearch(newSearch);
        
        const url = (typeof route === 'function') ? route("home") : '/';
        // Menggunakan debounce (jika ada) akan lebih baik di sini, tapi kita ikuti kode yang ada
        router.get(
            url, 
            { search: newSearch, filter: filter }, 
            { preserveState: true, replace: true }
        );
    };
    
    // Form untuk "Create" (Tidak Berubah)
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        is_finished: false,
        cover: null,
    });

    const handleCreateSubmit = (event) => {
        event.preventDefault();
        post("/todos", {
            onSuccess: () => {
                reset();
                setIsCreateOpen(false); // Tutup modal create
            },
            preserveScroll: true,
        });
    };

    // Fungsi untuk menangani 'DELETE' (Tidak Berubah)
    const handleDelete = () => {
        if (!deletingTodo) return;
        
        setIsDeleting(true); // Mulai loading
        
        router.delete(`/todos/${deletingTodo.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingTodo(null); // Tutup modal
                setIsDeleting(false); // Selesai loading
            },
            onError: () => {
                setIsDeleting(false); // Selesai loading (jika gagal)
            },
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section & Form Create (Tidak Berubah) */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "&#128075;",
                                }}
                            />
                            Hai! {auth.name}
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Apa yang ingin kamu pelajari hari ini?
                        </p>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-5">
                                    Buat Rencana
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Rencana Baru</DialogTitle>
                                    <DialogDescription>
                                        Isi detail rencanamu di bawah ini.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit}>
                                    <FieldGroup className="grid gap-4 py-4">
                                        <Field>
                                            <FieldLabel htmlFor="title-create">
                                                Judul
                                            </FieldLabel>
                                            <Input
                                                id="title-create"
                                                value={data.title}
                                                onChange={(e) =>
                                                    setData("title", e.target.value)
                                                }
                                                autoFocus
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-600">
                                                    {errors.title}
                                                </p>
                                            )}
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="description-create">
                                                Deskripsi (Opsional)
                                            </FieldLabel>
                                            <Textarea
                                                id="description-create"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData("description", e.target.value)
                                                }
                                                placeholder="Tulis deskripsi singkat..."
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-600">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="cover-create">
                                                Gambar (Opsional)
                                            </FieldLabel>
                                            <Input
                                                id="cover-create"
                                                type="file"
                                                onChange={(e) =>
                                                    setData("cover", e.target.files[0])
                                                }
                                            />
                                            {errors.cover && (
                                                <p className="text-sm text-red-600">
                                                    {errors.cover}
                                                </p>
                                            )}
                                        </Field>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_finished-create"
                                                checked={data.is_finished}
                                                onCheckedChange={(checked) =>
                                                    setData("is_finished", checked)
                                                }
                                            />
                                            <Label
                                                htmlFor="is_finished-create"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                Tandai sebagai selesai
                                            </Label>
                                        </div>
                                    </FieldGroup>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Menyimpan..."
                                                : "Simpan Rencana"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Tampilkan Daftar Todos */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">
                            Daftar Rencanamu
                        </h2>
                        
                        {/* INPUT SEARCH & FILTER BARU */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan judul atau deskripsi..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full md:w-3/4"
                            />
                            {/* Menggunakan elemen <select> native dengan styling dasar Tailwind (meniru komponen Input) */}
                            <select
                                value={filter}
                                onChange={handleFilterChange}
                                className="w-full md:w-1/4 h-10 border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                            >
                                <option value="all">Semua Status</option>
                                <option value="unfinished">Belum Selesai</option>
                                <option value="finished">Selesai</option>
                            </select>
                        </div>
                        {/* AKHIR INPUT SEARCH & FILTER BARU */}

                        {/* 2. Cek apakah ada data di todos.data */}
                        {todos.data.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-center">
                                        {/* Tampilkan pesan yang relevan jika tidak ada hasil setelah pencarian/filter */}
                                        {filters.search || filters.filter !== 'all'
                                            ? "Tidak ada rencana yang cocok dengan kriteria pencarian/filter Anda."
                                            : "Kamu belum punya rencana. Ayo buat satu!"}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            // 3. Tampilkan list dari todos.data
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {todos.data.map((todo) => (
                                    <Card key={todo.id} className="shadow-sm flex flex-col overflow-hidden">
                                        <div className="w-full h-40 overflow-hidden">
                                            {todo.cover_url ? (
                                                <img
                                                    src={todo.cover_url}
                                                    alt={todo.title}
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                                    <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                                        No Cover
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="mb-2">
                                                    {todo.is_finished ? (
                                                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                            Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                            Belum Selesai
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-medium text-lg">
                                                    {todo.title}
                                                </p>
                                                {todo.description && (
                                                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                                                        {todo.description}
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="mt-6 flex justify-end gap-2">
                                                <Link
                                                    href={`/todos/${todo.id}`}
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 bg-blue-600 text-white hover:bg-blue-700"
                                                >
                                                    Detail
                                                </Link>
                                                
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => setEditingTodo(todo)}
                                                >
                                                    Edit
                                                </Button>
                                                
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => setDeletingTodo(todo)}
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* 4. Render komponen pagination */}
                        <Pagination 
                            links={todos.links} 
                            currentPage={todos.current_page} 
                            lastPage={todos.last_page} 
                        />
                    </div>
                </div>
            </div>

            {/* Modal "Edit" dan "Delete" (Tidak Berubah) */}
            <EditTodoModal 
                todo={editingTodo} 
                onClose={() => setEditingTodo(null)} 
            />
            <Dialog open={!!deletingTodo} onOpenChange={() => setDeletingTodo(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apakah Anda Yakin?</DialogTitle>
                        <DialogDescription>
                            Aksi ini akan menghapus 
                            <span className="font-semibold text-foreground">
                                " {deletingTodo?.title} "
                            </span>
                            secara permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setDeletingTodo(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete} 
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}