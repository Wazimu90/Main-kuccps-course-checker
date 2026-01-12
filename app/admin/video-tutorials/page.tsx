"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Play,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Eye,
    EyeOff,
    Youtube,
    ExternalLink,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface VideoTutorial {
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

interface FormData {
    title: string
    description: string
    youtube_id: string
    duration: string
    display_order: number
    is_active: boolean
}

export default function AdminVideoTutorialsPage() {
    const [videos, setVideos] = useState<VideoTutorial[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAdding, setIsAdding] = useState(false)
    const [formData, setFormData] = useState<FormData>({
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
        <div className="min-h-screen bg-base p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                                    <Youtube className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-light">
                                        Video Tutorials
                                    </h1>
                                    <p className="text-sm text-dim">
                                        Manage video tutorials for the Student Tools page
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-dark font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                        >
                            <Plus className="w-5 h-5" />
                            Add Video
                        </button>
                    </div>
                </motion.div>

                {/* Add Video Form */}
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-6 rounded-2xl bg-surface border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-light">Add New Video</h2>
                            <button
                                onClick={cancelEdit}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-dim" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-light mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-base border border-white/10 text-light focus:border-accent focus:outline-none"
                                    placeholder="How to apply for KUCCPS"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light mb-2">
                                    YouTube Video ID *
                                </label>
                                <input
                                    type="text"
                                    value={formData.youtube_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, youtube_id: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-base border border-white/10 text-light focus:border-accent focus:outline-none"
                                    placeholder="dQw4w9WgXcQ"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-light mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-base border border-white/10 text-light focus:border-accent focus:outline-none min-h-[100px]"
                                    placeholder="Step-by-step guide on..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light mb-2">
                                    Duration
                                </label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duration: e.target.value })
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-base border border-white/10 text-light focus:border-accent focus:outline-none"
                                    placeholder="5:30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-light mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            display_order: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="w-full px-4 py-2 rounded-lg bg-base border border-white/10 text-light focus:border-accent focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={cancelEdit}
                                className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-light transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddVideo}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-dark font-semibold transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Add Video
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Videos List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-dim">Loading videos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl bg-surface border border-white/10">
                        <Youtube className="w-16 h-16 text-dim mx-auto mb-4" />
                        <p className="text-light text-lg font-semibold mb-2">
                            No videos found
                        </p>
                        <p className="text-dim">
                            Click "Add Video" to create your first video tutorial
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {videos.map((video) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl bg-surface border border-white/10 overflow-hidden"
                            >
                                {editingId === video.id ? (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-light">
                                                Edit Video
                                            </h3>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <X className="w-5 h-5 text-dim" />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-light mb-1">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, title: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2 rounded-lg bg-base border border-white/10 text-light text-sm focus:border-accent focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-light mb-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            description: e.target.value,
                                                        })
                                                    }
                                                    className="w-full px-3 py-2 rounded-lg bg-base border border-white/10 text-light text-sm focus:border-accent focus:outline-none min-h-[80px]"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-light mb-1">
                                                        YouTube ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.youtube_id}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                youtube_id: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 rounded-lg bg-base border border-white/10 text-light text-sm focus:border-accent focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-light mb-1">
                                                        Duration
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.duration}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                duration: e.target.value,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 rounded-lg bg-base border border-white/10 text-light text-sm focus:border-accent focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4">
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-light text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleUpdateVideo(video.id)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-dark text-sm font-semibold transition-colors"
                                            >
                                                <Save className="w-4 h-4" />
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Video Thumbnail */}
                                        <div className="relative aspect-video bg-gradient-to-br from-accent/10 to-accent/5">
                                            <Image
                                                src={`https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                                                alt={video.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                                                    <Play className="w-8 h-8 text-dark fill-dark ml-1" />
                                                </div>
                                            </div>
                                            {video.duration && (
                                                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/80">
                                                    <span className="text-xs font-semibold text-white">
                                                        {video.duration}
                                                    </span>
                                                </div>
                                            )}
                                            {!video.is_active && (
                                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/90">
                                                    <span className="text-xs font-semibold text-white">
                                                        Inactive
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Info */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-light mb-2 line-clamp-2">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-dim mb-3 line-clamp-2">
                                                {video.description}
                                            </p>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                                    <span className="text-xs text-dim">
                                                        Order: {video.display_order}
                                                    </span>
                                                </div>
                                                <a
                                                    href={`https://youtube.com/watch?v=${video.youtube_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3 text-accent" />
                                                    <span className="text-xs text-accent">View on YouTube</span>
                                                </a>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(video)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${video.is_active
                                                            ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                                                            : "bg-success/20 border border-success/30 text-success hover:bg-success/30"
                                                        }`}
                                                >
                                                    {video.is_active ? (
                                                        <>
                                                            <EyeOff className="w-4 h-4" />
                                                            Deactivate
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="w-4 h-4" />
                                                            Activate
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => startEdit(video)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 text-sm font-medium transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVideo(video.id)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-sm font-medium transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
