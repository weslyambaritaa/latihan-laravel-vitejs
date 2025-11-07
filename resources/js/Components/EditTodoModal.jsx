import React, { useEffect, useState, useRef } from "react";
import { useForm } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

// Komponen ini menerima 2 props:
// 1. todo: Objek todo yang akan diedit (jika null, modal tidak tampil)
// 2. onClose: Fungsi untuk dipanggil saat modal ditutup
export default function EditTodoModal({ todo, onClose }) {
    // Tentukan apakah modal terbuka berdasarkan prop 'todo'
    const isOpen = !!todo;
    const fileInputRef = useRef(null);

    // Siapkan form
    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        description: "",
        is_finished: false,
        cover: null,
        remove_cover: false,
    });

    // useEffect ini akan mengisi form dengan data
    // setiap kali prop 'todo' berubah
    useEffect(() => {
        if (todo) {
            setData({
                title: todo.title,
                description: todo.description || "",
                is_finished: todo.is_finished,
                cover: null, // Selalu reset file input
                remove_cover: false, // Selalu reset checkbox
            });
            // Reset input file secara manual
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    }, [todo]);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Kirim ke rute update, dengan 'id' dari todo
        post(`/todos/${todo.id}`, {
            onSuccess: () => onClose(), // Tutup modal jika berhasil
            preserveScroll: true,
        });
    };

    const handleClose = () => {
        if (!processing) {
            onClose();
        }
    };

    // Handler untuk input file
    const handleFileChange = (e) => {
        setData("cover", e.target.files[0]);
        setData("remove_cover", false); // Matikan "remove" jika file baru dipilih
    };

    // Handler untuk checkbox "Hapus"
    const handleRemoveChange = (checked) => {
        setData("remove_cover", checked);
        if (checked) {
            setData("cover", null); // Hapus data file jika "remove" dicentang
            // Reset input file
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={handleClose}>
                <DialogHeader>
                    <DialogTitle>Edit Rencana</DialogTitle>
                    <DialogDescription>
                        Ubah data rencanamu. Klik simpan jika selesai.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <FieldGroup className="grid gap-4 py-4">
                        <Field>
                            <FieldLabel htmlFor="title">Judul</FieldLabel>
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

                        {/* Tampilkan gambar saat ini (jika ada) */}
                        {todo?.cover_url && (
                            <div className="mb-2">
                                <Label>Gambar Saat Ini</Label>
                                <img
                                    src={todo.cover_url}
                                    alt="Cover"
                                    className="mt-2 w-full h-40 object-cover rounded-md border"
                                />
                            </div>
                        )}

                        {/* Input file untuk ganti gambar */}
                        <Field>
                            <FieldLabel htmlFor="cover-edit">
                                {todo?.cover_url ? "Ganti Gambar" : "Upload Gambar"} (Opsional)
                            </FieldLabel>
                            <Input
                                id="cover-edit" // Beri id unik agar tidak bentrok
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={data.remove_cover} // Matikan jika "remove" dicentang
                            />
                            {errors.cover && (
                                <p className="text-sm text-red-600">
                                    {errors.cover}
                                </p>
                            )}
                        </Field>

                        {/* Checkbox untuk hapus gambar (hanya tampil jika gambar ada) */}
                        {todo?.cover_url && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remove_cover"
                                    checked={data.remove_cover}
                                    onCheckedChange={handleRemoveChange}
                                    disabled={!!data.cover} // Matikan jika file baru dipilih
                                />
                                <Label
                                    htmlFor="remove_cover"
                                    className="text-sm font-medium"
                                >
                                    Hapus gambar saat ini
                                </Label>
                            </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="is_finished-edit" // Beri id unik
                                checked={data.is_finished}
                                onCheckedChange={(checked) =>
                                    setData("is_finished", checked)
                                }
                            />
                            <Label
                                htmlFor="is_finished-edit"
                                className="text-sm font-medium leading-none"
                            >
                                Tandai sebagai selesai
                            </Label>
                        </div>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}