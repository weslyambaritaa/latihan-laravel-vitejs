import React, { useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

export default function ChangeCoverModal({ todo, isOpen, onClose }) {
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        cover: null,
        remove_cover: false,
    });

    // Reset form setiap kali modal dibuka
    useEffect(() => {
        if (isOpen) {
            reset();
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    }, [isOpen]);

    const handleSubmit = (event) => {
        event.preventDefault();
        post(`/todos/${todo.id}/cover`, {
            onSuccess: () => onClose(),
            preserveScroll: true,
        });
    };

    const handleFileChange = (e) => {
        setData("cover", e.target.files[0]);
        setData("remove_cover", false);
    };

    const handleRemoveChange = (checked) => {
        setData("remove_cover", checked);
        if (checked) {
            setData("cover", null);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ganti Gambar Sampul</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <FieldGroup className="grid gap-4 py-4">
                        {/* Gambar saat ini */}
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

                        <Field>
                            <FieldLabel htmlFor="cover-change">
                                {todo?.cover_url ? "Ganti Gambar" : "Upload Gambar"}
                            </FieldLabel>
                            <Input
                                id="cover-change"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={data.remove_cover}
                            />
                            {errors.cover && (
                                <p className="text-sm text-red-600">
                                    {errors.cover}
                                </p>
                            )}
                        </Field>

                        {/* Checkbox hapus (hanya jika gambar ada) */}
                        {todo?.cover_url && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remove_cover_change"
                                    checked={data.remove_cover}
                                    onCheckedChange={handleRemoveChange}
                                    disabled={!!data.cover}
                                />
                                <Label
                                    htmlFor="remove_cover_change"
                                    className="text-sm font-medium"
                                >
                                    Hapus gambar saat ini
                                </Label>
                            </div>
                        )}
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}