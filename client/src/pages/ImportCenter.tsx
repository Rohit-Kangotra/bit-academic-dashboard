import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchApi } from '@/lib/api';

export default function ImportCenter() {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(false);
    const [tempFilePath, setTempFilePath] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            handlePreview(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    const handlePreview = async (uploadFile: File) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            // Use raw fetch because fetchApi wrapper sets application/json which breaks FormData boundaries
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/import-preview', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();

            setPreviewData(data.preview);
            setTotalRows(data.totalRows);
            setTempFilePath(data.filePath);

            toast({
                title: "Preview Generated",
                description: `Found ${data.totalRows} valid rows in ${uploadFile.name}.`,
            });
        } catch (error: any) {
            toast({
                title: "Preview Failed",
                description: error.message || "Could not parse Excel file.",
                variant: "destructive"
            });
            setFile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!tempFilePath || !file) return;
        setLoading(true);

        try {
            const data = await fetchApi('/api/v1/admin/import-commit', {
                method: 'POST',
                body: JSON.stringify({
                    filePath: tempFilePath,
                    originalName: file.name
                })
            });

            toast({
                title: "Import Successful",
                description: data.message,
            });

            // Reset state
            setFile(null);
            setPreviewData([]);
            setTotalRows(0);
            setTempFilePath(null);
        } catch (error: any) {
            toast({
                title: "Import Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Management Center</h1>
                <p className="text-muted-foreground mt-2">
                    Upload and verify Excel spreadsheets to populate the Academic ERP database.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" /> File Upload
                        </CardTitle>
                        <CardDescription>Drag and drop your spreadsheet here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            {...getRootProps()}
                            className={`p-10 text-center rounded-xl cursor-pointer transition-colors ${isDragActive ? 'bg-primary/10 border-primary' : 'hover:bg-accent/50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            {isDragActive ? (
                                <p className="font-medium text-primary">Drop the file here...</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="font-medium">Click or drag a file here</p>
                                    <p className="text-xs text-muted-foreground">
                                        Supports .xlsx and .xls
                                    </p>
                                </div>
                            )}
                        </div>

                        {file && (
                            <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg border">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FileSpreadsheet className="w-8 h-8 text-green-500 shrink-0" />
                                    <div className="truncate">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Data Preview</CardTitle>
                            <CardDescription>Review the parsed schema before committing to the database.</CardDescription>
                        </div>
                        {totalRows > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm px-3 py-1 bg-primary/10 text-primary font-medium rounded-full">
                                    {totalRows} Rows Detected
                                </span>
                                <Button
                                    onClick={handleCommit}
                                    disabled={loading}
                                    className="shadow-md"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Confirm & Import
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        {loading && !previewData.length ? (
                            <div className="py-20 text-center text-muted-foreground flex flex-col items-center">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                Processing file buffers...
                            </div>
                        ) : previewData.length > 0 ? (
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted border-b">
                                        <tr>
                                            {Object.keys(previewData[0]).map((key) => (
                                                <th key={key} className="h-10 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="h-10 px-4 align-middle whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                                        {String(val)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {totalRows > previewData.length && (
                                    <div className="p-3 text-center text-xs text-muted-foreground border-t bg-muted/30">
                                        Showing first {previewData.length} of {totalRows} rows
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground flex flex-col items-center bg-muted/20 rounded-lg border border-dashed">
                                <AlertCircle className="w-8 h-8 mb-3 opacity-20" />
                                <p>No preview available.</p>
                                <p className="text-sm mt-1">Upload a valid tracking sheet to view data.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
