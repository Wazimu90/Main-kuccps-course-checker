"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Youtube, Play, Edit, Trash2, Plus, Save, X, Eye, EyeOff, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type VideoTutorial = {
    id: string
    title: string
    description: string
    youtube_id: string
    duration: string | null
    display_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export function VideoTutorialsTab() {
    const [videos, setVideos] = useState<VideoTutorial[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState<{
        title: string
        description: string
        youtube_id: string
        duration: string
        display_order: number
        is_active: boolean
    }>({
        title: "",
        description: "",
        youtube_id: "",
        duration: "",
        display_order: 0,
        is_active: true,
    })
    const { toast } = useToast()

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/video-tutorials?includeInactive=true")
            const data = await response.json()

            if (response.ok) {
                setVideos(data.videos || [])
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch videos",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error fetching videos:", error)
            toast({
                title: "Error",
                description: "Failed to fetch videos",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAddVideo = async () => {
        if (!formData.title || !formData.description || !formData.youtube_id) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await fetch("/api/video-tutorials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Video tutorial added successfully",
                })
                setIsAdding(false)
                setFormData({
                    title: "",
                    description: "",
                    youtube_id: "",
                    duration: "",
                    display_order: 0,
                    is_active: true,
                })
                fetchVideos()
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to add video",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error adding video:", error)
            toast({
                title: "Error",
                description: "Failed to add video",
                variant: "destructive",
            })
        }
    }

    const handleUpdateVideo = async (id: string) => {
        try {
            const response = await fetch(`/api/video-tutorials/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Video tutorial updated successfully",
                })
                setEditingId(null)
                fetchVideos()
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update video",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error updating video:", error)
            toast({
                title: "Error",
                description: "Failed to update video",
                variant: "destructive",
            })
        }
    }

    const handleDeleteVideo = async (id: string) => {
        if (!confirm("Are you sure you want to delete this video tutorial?")) {
            return
        }

        try {
            const response = await fetch(`/api/video-tutorials/${id}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Video tutorial deleted successfully",
                })
                fetchVideos()
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to delete video",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error deleting video:", error)
            toast({
                title: "Error",
                description: "Failed to delete video",
                variant: "destructive",
            })
        }
    }

    const handleToggleActive = async (video: VideoTutorial) => {
        try {
            const response = await fetch(`/api/video-tutorials/${video.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !video.is_active }),
            })

            const data = await response.json()

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Video ${video.is_active ? "deactivated" : "activated"} successfully`,
                })
                fetchVideos()
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to toggle video status",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error toggling video status:", error)
            toast({
                title: "Error",
                description: "Failed to toggle video status",
                variant: "destructive",
            })
        }
    }

    const startEdit = (video: VideoTutorial) => {
        setEditingId(video.id)
        setFormData({
            title: video.title,
            description: video.description,
            youtube_id: video.youtube_id,
            duration: video.duration || "",
            display_order: video.display_order,
            is_active: video.is_active,
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setIsAdding(false)
        setFormData({
            title: "",
            description: "",
            youtube_id: "",
            duration: "",
            display_order: 0,
            is_active: true,
        })
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Video Tutorials Management</CardTitle>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                </Button>
            </CardHeader>
            <CardContent>
                {/* Add Video Form */}
                {isAdding && (
                    <div className="mb-6 p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Add New Video</h3>
                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Title *</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="How to apply for KUCCPS"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">YouTube Video ID *</label>
                                <Input
                                    value={formData.youtube_id}
                                    onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
                                    placeholder="dQw4w9WgXcQ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Duration</label>
                                <Input
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="5:30"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Step-by-step guide on..."
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Display Order</label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) =>
                                        setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={cancelEdit}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddVideo}>
                                <Save className="h-4 w-4 mr-2" />
                                Add Video
                            </Button>
                        </div>
                    </div>
                )}

                {/* Videos Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-muted-foreground">Loading videos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12 rounded-lg border border-dashed">
                        <Youtube className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-semibold mb-2">No video tutorials found</p>
                        <p className="text-muted-foreground mb-4">Click "Add Video" to create your first video tutorial</p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Thumbnail</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>YouTube ID</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {videos.map((video) => (
                                    <TableRow key={video.id}>
                                        {editingId === video.id ? (
                                            <>
                                                <TableCell colSpan={7}>
                                                    <div className="p-4 bg-muted/30 rounded-lg">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-lg font-semibold">Edit Video</h3>
                                                            <Button variant="ghost" size="icon" onClick={cancelEdit}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium mb-2">Title</label>
                                                                <Input
                                                                    value={formData.title}
                                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-2">YouTube ID</label>
                                                                <Input
                                                                    value={formData.youtube_id}
                                                                    onChange={(e) =>
                                                                        setFormData({ ...formData, youtube_id: e.target.value })
                                                                    }
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-2">Duration</label>
                                                                <Input
                                                                    value={formData.duration}
                                                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium mb-2">Description</label>
                                                                <Textarea
                                                                    value={formData.description}
                                                                    onChange={(e) =>
                                                                        setFormData({ ...formData, description: e.target.value })
                                                                    }
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-2">Display Order</label>
                                                                <Input
                                                                    type="number"
                                                                    value={formData.display_order}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            display_order: parseInt(e.target.value) || 0,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2 mt-4">
                                                            <Button variant="outline" onClick={cancelEdit}>
                                                                Cancel
                                                            </Button>
                                                            <Button onClick={() => handleUpdateVideo(video.id)}>
                                                                <Save className="h-4 w-4 mr-2" />
                                                                Save Changes
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>
                                                    <div className="relative w-24 h-14 rounded overflow-hidden">
                                                        <Image
                                                            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                                                            alt={video.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="96px"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                            <Play className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{video.title}</p>
                                                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                            {video.description}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <a
                                                        href={`https://youtube.com/watch?v=${video.youtube_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-primary hover:underline"
                                                    >
                                                        <code className="text-xs">{video.youtube_id}</code>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </TableCell>
                                                <TableCell>{video.duration || "—"}</TableCell>
                                                <TableCell>{video.display_order}</TableCell>
                                                <TableCell>
                                                    {video.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                                                            <Eye className="w-3 h-3" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-600 text-xs font-medium">
                                                            <EyeOff className="w-3 h-3" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleActive(video)}
                                                        >
                                                            {video.is_active ? (
                                                                <>
                                                                    <EyeOff className="w-4 h-4 mr-1" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => startEdit(video)}>
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteVideo(video.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
