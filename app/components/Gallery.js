// Import necessary modules and components
"use client";
import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// Define the Gallery component
const Gallery = () => {
  // State variables to manage images, featured image, selected images, and more
  const [images, setImages] = useState([
    "/image-1.webp",
    "/image-2.webp",
    "/image-3.webp",
    "/image-4.webp",
    "/image-5.webp",
    "/image-6.webp",
    "/image-7.webp",
    "/image-8.webp",
    "/image-9.webp",
    "/image-10.jpeg",
    "/image-11.jpeg",
  ]);

  const [featuredImage, setFeaturedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndices, setSelectedImageIndices] = useState([]);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  // Function to move images within the gallery
  const moveImage = (dragIndex, hoverIndex) => {
    // Clone the images array to work with a copy
    const updatedImages = [...images];
    // Remove the dragged image from its original position
    const [draggedImage] = updatedImages.splice(dragIndex, 1);
    // Insert the dragged image at the new position
    updatedImages.splice(hoverIndex, 0, draggedImage);

    // If the dragged image is not the featured image and it's moved to the last position, set it as the new featured image
    if (dragIndex !== images.length - 1 && hoverIndex === images.length - 1) {
      if (draggedImage !== featuredImage) {
        setFeaturedImage(draggedImage);
      }
    }

    // Update the images state with the new order
    setImages(updatedImages);
  };

  // Function to handle the start of a drag operation
  const handleDragStart = (image) => {
    // Find the index of the dragged image
    const imageIndex = images.findIndex((img) => img === image);
    // Add the index to the selectedImageIndices state if not already there
    if (!selectedImageIndices.includes(imageIndex)) {
      setSelectedImageIndices([...selectedImageIndices, imageIndex]);
    }
  };

  // Function to handle the end of a drag operation
  const handleDragEnd = () => {
    // Clear the selectedImageIndices state
    setSelectedImageIndices([]);
  };

  // Function to set an image as the featured image
  const handleImageFeature = (image) => {
    if (image !== featuredImage) {
      setFeaturedImage(image);
    }
  };

  // Image component to render individual images
  const Image = ({ image, index }) => {
    // Hook for enabling the drop target for reordering
    const [, ref] = useDrop({
      accept: "IMAGE",
      hover: (draggedItem) => {
        if (draggedItem.index !== index) {
          moveImage(draggedItem.index, index);
          draggedItem.index = index;
        }
      },
    });

    // Hook for enabling the drag operation
    const [, refDrag] = useDrag({
      type: "IMAGE",
      item: { type: "IMAGE", index, isFeaturedImage: image === featuredImage },
    });

    // Adjust opacity for selected images
    const opacity = selectedImageIndices.includes(index) ? 0.5 : 1;

    // Click handler for selecting an image
    const handleClick = () => {
      handleDragStart(image);
    };

    // Double-click handler for setting an image as featured
    const handleImageFeatureClick = () => {
      handleImageFeature(image);
    };

    return (
      <div
        ref={(node) => ref(refDrag(node))}
        style={{
          opacity,
          background: "white",
          cursor: "pointer",
          border: "1px solid #ccc",
          margin: "4px",
          width: "100%",
          height: "100%",
          transition: "opacity 0.3s ease",
          position: "relative",
        }}
        onClick={handleClick}
        onDoubleClick={handleImageFeatureClick}
      >
        {selectedImageIndices.includes(index) && (
          <input
            className="absolute z-50 left-2 top-2"
            type="checkbox"
            checked={selectedImages.includes(image)}
            onChange={() => toggleImageSelection(image)}
          />
        )}
        <img
          src={image}
          alt={`Image ${index}`}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  };

  // Function to toggle image selection
  const toggleImageSelection = (image) => {
    if (selectedImages.includes(image)) {
      setSelectedImages(
        selectedImages.filter((selectedImage) => selectedImage !== image)
      );
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  // Function to handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Clone the images array to work with a copy
      const newImages = [...images];
      // Insert the new image URL at the second-to-last position
      newImages.splice(images.length - 1, 0, URL.createObjectURL(file));
      // Update the images state with the new image
      setImages(newImages);
    }
  };

  // Function to handle image deletion
  const handleDeleteClick = () => {
    // Filter out selected images and create a new array
    const updatedImages = images.filter(
      (image) => !selectedImages.includes(image)
    );
    // Update the images state with the filtered array
    setImages(updatedImages);
    // Clear the selectedImages and selectedImageIndices states
    setSelectedImages([]);
    setSelectedImageIndices([]);
    // Show a delete message for a brief period
    setShowDeleteMessage(true);

    setTimeout(() => {
      setShowDeleteMessage(false);
    }, 4000);
  };

  // Effect to save the image order in local storage
  useEffect(() => {
    localStorage.setItem("imageOrder", JSON.stringify(images));
  }, [images]);

  // Effect to load the image order from local storage on component mount
  useEffect(() => {
    const storedImageOrder = JSON.parse(localStorage.getItem("imageOrder"));
    if (storedImageOrder) {
      setImages(storedImageOrder);
    }
  }, []);

  // Effect to set a featured image if none is set when images are available
  useEffect(() => {
    if (images.length > 0) {
      if (!featuredImage) {
        setFeaturedImage(images[images.length - 1]);
      }
    }
  }, [images, featuredImage]);

  // Render the Gallery component
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="text-2xl font-semibold">Image Gallery</h2>
            <p> For setting featured image, please press double click.</p>
          </div>
          <div>
            {selectedImages.length > 0 && (
              <button onClick={handleDeleteClick}>Delete</button>
            )}
            {showDeleteMessage && (
              <p className="text-red-500">Images deleted successfully.</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="relative row-span-2 col-span-2">
            {featuredImage && (
              <div className="w-full h-full m-1">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-full bg-white"
                />
              </div>
            )}
          </div>
          {images.map(
            (image, index) =>
              image !== featuredImage && (
                <div
                  key={image}
                  className="w-full 2xl:w-[290.4px] h-full 2xl:h-300.4px transition-opacity hover:opacity-80"
                >
                  <Image image={image} index={index} />
                </div>
              )
          )}
          <div className="w-full h-full flex items-center justify-center bg-white m-1">
            <label
              htmlFor="imageUpload"
              className="w-[152px] sm:w-[290.4px] h-[160px] sm:h-[300.4px] flex flex-col justify-center items-center"
            >
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <img
                src="/add.png"
                alt="Add New Image"
                className="mb-2 object-contain cursor-pointer"
              />
              <p className="text-gray-600 text-sm font-medium">Add New Image</p>
            </label>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

// Export the Gallery component
export default Gallery;
