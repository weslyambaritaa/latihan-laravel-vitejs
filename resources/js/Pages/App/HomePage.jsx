import React, { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/components/ui/button"; // Button sudah di-import
import { Input } from "@/components/ui/input";
import { useForm, usePage } from "@inertiajs/react";
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

export default function HomePage() {
    const { auth, todos } = usePage().props;
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        is_finished: false,
        cover: null,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/todos", {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section & Form (Tidak Berubah) */}
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

                        <Dialog open={open} onOpenChange={setOpen}>
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
                                <form onSubmit={handleSubmit}>
                                    <FieldGroup className="grid gap-4 py-4">
                                        <Field>
                                            <FieldLabel htmlFor="title">
                                                Judul
                                            </FieldLabel>
                                            <Input
                                                id="title"
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
                                            <FieldLabel htmlFor="description">
                                                Deskripsi (Opsional)
                                            </FieldLabel>
                                            <Textarea
                                                id="description"
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
                                            <FieldLabel htmlFor="cover">
                                                Gambar (Opsional)
                                            </FieldLabel>
                                            <Input
                                                id="cover"
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
                                                id="is_finished"
                                                checked={data.is_finished}
                                                onCheckedChange={(checked) =>
                                                    setData("is_finished", checked)
                                                }
                                            />
                                            <Label
                                                htmlFor="is_finished"
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

                    {/* --- PERUBAHAN DI SINI --- */}
                    {/* Tampilkan Daftar Todos */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">
                            Daftar Rencanamu
                        </h2>
                        {todos.length === 0 && (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-center">
                                        Kamu belum punya rencana. Ayo buat satu!
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Update Tampilan Card */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {todos.map((todo) => (
                                <Card key={todo.id} className="shadow-sm flex flex-col overflow-hidden">
                                    {/* Tampilkan gambar jika ada */}
                                    {todo.cover_url && (
                                        <img
                                            src={todo.cover_url}
                                            alt={todo.title}
                                            className="w-full h-40 object-cover"
                                        />
                                    )}
                                    
                                    {/* Konten Card (flex-col) */}
                                    <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                                        {/* Bagian Atas: Info */}
                                        <div>
                                            {/* Status */}
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
                                            
                                            {/* Judul */}
                                            <p className="font-medium text-lg">
                                                {todo.title}
                                            </p>
                                            
                                            {/* Deskripsi (jika ada) */}
                                            {todo.description && (
                                                <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                                                    {todo.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Bagian Bawah: Tombol Aksi */}
                                        <div className="mt-6 flex justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Detail
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm">
                                                Hapus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    {/* --- BATAS PERUBAHAN --- */}
                    
                </div>
            </div>
        </AppLayout>
    );
}