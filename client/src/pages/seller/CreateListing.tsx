import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Upload, Loader2, CheckCircle, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/config/api/axiosInstance";

interface AIAnalysis {
  detectedMaterials: Array<{
    materialType: string;
    confidence: number;
    estimatedWeight: number;
    estimatedValue: number;
  }>;
  totalEstimatedWeight: number;
  totalEstimatedValue: number;
  category: string;
  description: string;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [materials, setMaterials] = useState<string[]>([]);
  const [deadlineHours, setDeadlineHours] = useState<number>(24);
  const [customDeadline, setCustomDeadline] = useState<string>("");

  // Upload & Analyze
  const { mutate: analyzeImage, isPending: isAnalyzing } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      console.log(file);
      formData.append("image", file);
      const response = await axiosInstance.post(
        "/seller/listing/analyze",
        formData,
      );
      return response;
    },
    onSuccess: (data) => {
      setImageUrl(data.data.imageUrl);
      setAiAnalysis(data.data.aiAnalysis);
      setWeight(data.data.aiAnalysis.totalEstimatedWeight);
      setPrice(data.data.aiAnalysis.totalEstimatedValue);
      setMaterials(
        data.data.aiAnalysis.detectedMaterials.map((m: any) => m.materialType),
      );
      setDescription(data.data.aiAnalysis.description);
      setTitle(
        `${data.data.aiAnalysis.category} Waste - ${data.data.aiAnalysis.totalEstimatedWeight}kg`,
      );
      setStep(2);
    },
  });

  // Create Listing
  const { mutate: createListing, isPending: isCreating } = useMutation({
    mutationFn: async () => {
      // Get location with timeout
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
          }

          const timeoutId = setTimeout(() => {
            reject(
              new Error(
                "Location request timed out. Please allow location access.",
              ),
            );
          }, 10000);

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              resolve(pos);
            },
            (err) => {
              clearTimeout(timeoutId);
              let errorMessage = "Failed to get location.";
              if (err.code === err.PERMISSION_DENIED) {
                errorMessage =
                  "Location permission denied. Please enable location services.";
              } else if (err.code === err.POSITION_UNAVAILABLE) {
                errorMessage = "Location information is unavailable.";
              } else if (err.code === err.TIMEOUT) {
                errorMessage = "Location request timed out.";
              }
              reject(new Error(errorMessage));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        },
      );

      // Ensure category is lowercase to match backend enum
      const validCategory = aiAnalysis?.category
        ? aiAnalysis.category.toLowerCase()
        : "mixed";

      const listingData = {
        title,
        description,
        category: validCategory,
        aiAnalysis: aiAnalysis,
        images: [imageUrl],
        primaryImage: imageUrl,
        location: {
          type: "Point" as const,
          coordinates: [position.coords.longitude, position.coords.latitude],
        },
        address: {
          city: "Colombo",
          district: "Colombo",
        },
        pickupRadius: 5,
        manualOverrides: {
          weight,
          materials,
        },
        biddingDeadline:
          deadlineHours === 0 && customDeadline
            ? new Date(customDeadline).toISOString()
            : new Date(
                Date.now() + deadlineHours * 60 * 60 * 1000,
              ).toISOString(),
        status: "active" as const,
      };

      const response = await axiosInstance.post(
        "/seller/listing/create",
        listingData,
      );
      return response;
    },
    onSuccess: () => {
      setStep(3);
    },
    onError: (error: any) => {
      console.error("Error creating listing:", error);
      // Alert the user about the error
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      alert(`Failed to create listing: ${message}`);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // STEP 1: Upload Image
  if (step === 1) {
    return (
      <div className="h-full overflow-y-auto bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create New Listing
          </h1>
          <p className="text-gray-400 mb-8">
            Upload a photo of your recyclable waste to get started
          </p>

          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-green-600 bg-green-900/20"
                  : "border-gray-600 hover:border-green-500"
              }`}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-lg mb-4"
                  />
                  <p className="text-sm text-gray-400">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-xl font-medium text-white mb-2">
                    Drag & drop your waste photo
                  </p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported: JPG, PNG, WEBP (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {imageFile && (
              <Button
                className="w-full mt-6 bg-green-600 hover:bg-green-700 h-12 text-lg"
                onClick={() => analyzeImage(imageFile)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI is analyzing your waste...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Analyze with ScrapLens AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Review & Edit
  if (step === 2) {
    return (
      <div className="h-full overflow-y-auto bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            Review AI Analysis
          </h1>
          <p className="text-gray-400 mb-8">
            Verify and edit the details before posting
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <img
                src={imageUrl}
                alt="Waste"
                className="w-full rounded-lg mb-4"
              />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Detected Materials
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis?.detectedMaterials.map((material, i) => (
                      <span
                        key={i}
                        className="bg-green-900/30 text-green-400 border border-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {material.materialType} (
                        {material.confidence.toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {aiAnalysis?.category}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400">Confidence</p>
                    <p className="text-lg font-semibold text-green-400">
                      {aiAnalysis?.detectedMaterials[0]?.confidence.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">
                  Listing Title
                </Label>
                <Input
                  id="title"
                  placeholder="E.g., Mixed Plastic Bottles - 5kg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Describe the condition and any additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-md p-3 min-h-[100px] text-white placeholder:text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="weight"
                    className="text-gray-300 flex items-center gap-2"
                  >
                    Estimated Weight (kg)
                    <Edit2 size={14} className="text-gray-500" />
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    className="mt-2 bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="price"
                    className="text-gray-300 flex items-center gap-2"
                  >
                    Estimated Value (Rs.)
                    <Edit2 size={14} className="text-gray-500" />
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="mt-2 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline" className="text-gray-300">
                  Bidding Deadline
                </Label>
                <select
                  id="deadline"
                  value={deadlineHours}
                  onChange={(e) => setDeadlineHours(parseInt(e.target.value))}
                  className="mt-2 w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                >
                  <option value={6}>6 Hours</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours (1 Day)</option>
                  <option value={48}>48 Hours (2 Days)</option>
                  <option value={72}>72 Hours (3 Days)</option>
                  <option value={0}>Custom Date & Time</option>
                </select>

                {deadlineHours === 0 && (
                  <div className="mt-2">
                    <Label htmlFor="customDate" className="text-gray-300">
                      Select End Time
                    </Label>
                    <Input
                      id="customDate"
                      type="datetime-local"
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      min={new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)}
                      onChange={(e) => setCustomDeadline(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weight:</span>
                    <span className="text-white font-semibold">
                      {weight} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Value:</span>
                    <span className="text-green-400 font-semibold">
                      Rs. {price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white capitalize">
                      {aiAnalysis?.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => createListing()}
                  disabled={isCreating || !title || !description}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Post Listing"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Success
  return (
    <div className="flex h-full items-center justify-center bg-gray-900">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md border border-gray-700 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Listing Created!</h2>
        <p className="text-gray-400 mb-4">
          Your listing is now live and collectors can see it on the map.
        </p>
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400">Expected bids within</p>
          <p className="text-2xl font-bold text-green-400">2-4 hours</p>
        </div>

        <Button
          onClick={() => navigate("/seller/dashboard")}
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
