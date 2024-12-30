class InfinityGallery {
  constructor() {
    // DOM Elements
    this.gallery = document.getElementById("gallery");
    this.categoryFilter = document.getElementById("categoryFilter");
    this.searchInput = document.getElementById("searchInput");
    this.searchButton = document.querySelector(".search-button");

    // Fullscreen Modal Elements
    this.fullscreenModal = document.getElementById("fullscreenModal");
    this.fullscreenImage = document.getElementById("fullscreenImage");
    this.closeButton = document.querySelector(".close-button");
    this.copyUrlButton = document.querySelector(".copy-url-btn");
    this.prevButton = document.querySelector(".prev-image");
    this.nextButton = document.querySelector(".next-image");

    // Gallery State
    this.imageData = [];
    this.filteredImages = [];
    this.currentImageIndex = 0;

    // Initialization
    this.init();
  }

  init() {
    this.parseImageUrls();
    this.createCategoryButtons();
    this.addEventListeners();
    this.displayImages(this.imageData);
  }

  parseImageUrls() {
    const urlContainers = document.querySelectorAll("#image-urls > div");

    urlContainers.forEach((container) => {
      const category = container.dataset.category;
      const icon = container.dataset.icon;
      const urls = container.textContent
        .trim()
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url);

      urls.forEach((url) => {
        this.imageData.push({
          url,
          category,
          icon,
        });
      });
    });
  }

  createCategoryButtons() {
    // Get unique categories
    const categories = [...new Set(this.imageData.map((img) => img.category))];

    categories.forEach((category) => {
      const imageForCategory = this.imageData.find(
        (img) => img.category === category
      );
      const icon = imageForCategory ? imageForCategory.icon : "fas fa-tag";

      const button = document.createElement("button");
      button.className = "category-btn";
      button.innerHTML = `<i class="${icon}"></i> ${category}`;
      button.dataset.category = category;

      button.addEventListener("click", () => this.filterByCategory(category));
      this.categoryFilter.appendChild(button);
    });
  }

  displayImages(images) {
    this.gallery.innerHTML = "";

    images.forEach((image, index) => {
      const item = document.createElement("div");
      item.className = "gallery-item";

      item.innerHTML = `
                <img src="${image.url}" alt="${image.category}" data-index="${index}">
                <div class="image-overlay">
                    <div class="overlay-buttons">
                        <button class="overlay-btn copy-btn" data-url="${image.url}">
                            <i class="fas fa-link"></i>
                        </button>
                        <button class="overlay-btn view-btn" data-index="${index}">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            `;

      this.gallery.appendChild(item);
    });

    this.addImageEventListeners();
  }

  addImageEventListeners() {
    // Copy URL Buttons
    const copyButtons = this.gallery.querySelectorAll(".copy-btn");
    copyButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const url = e.currentTarget.dataset.url;
        this.copyImageUrl(url);
      });
    });

    // View Buttons
    const viewButtons = this.gallery.querySelectorAll(".view-btn");
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.openFullscreen(index);
      });
    });
  }

  filterByCategory(category) {
    // Remove active class from all buttons
    const buttons = this.categoryFilter.querySelectorAll(".category-btn");
    buttons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to selected category
    const selectedButton = [...buttons].find(
      (btn) => btn.dataset.category === category
    );
    if (selectedButton) {
      selectedButton.classList.add("active");
    }

    // Filter images
    this.filteredImages = this.imageData.filter(
      (img) => img.category === category
    );
    this.displayImages(this.filteredImages);
  }

  handleSearch() {
    const searchTerm = this.searchInput.value.toLowerCase();

    this.filteredImages = this.imageData.filter(
      (img) =>
        img.category.toLowerCase().includes(searchTerm) ||
        img.url.toLowerCase().includes(searchTerm)
    );

    this.displayImages(this.filteredImages);
  }

  openFullscreen(index) {
    const images =
      this.filteredImages.length > 0 ? this.filteredImages : this.imageData;
    this.currentImageIndex = index;

    this.fullscreenImage.src = images[index].url;
    this.fullscreenModal.style.display = "flex";
  }

  closeFullscreen() {
    this.fullscreenModal.style.display = "none";
  }

  navigateImage(direction) {
    const images =
      this.filteredImages.length > 0 ? this.filteredImages : this.imageData;

    if (direction === "next") {
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    } else {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + images.length) % images.length;
    }

    this.fullscreenImage.src = images[this.currentImageIndex].url;
  }

  copyImageUrl(url) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.showNotification("Image URL Copied!", "success");
      })
      .catch((err) => {
        this.showNotification("Failed to copy URL", "error");
      });
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const container = document.getElementById("notificationContainer");
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        container.removeChild(notification);
      }, 500);
    }, 3000);
  }

  addEventListeners() {
    // Search
    this.searchButton.addEventListener("click", () => this.handleSearch());
    this.searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });

    // Fullscreen Modal
    this.closeButton.addEventListener("click", () => this.closeFullscreen());
    this.copyUrlButton.addEventListener("click", () => {
      const images =
        this.filteredImages.length > 0 ? this.filteredImages : this.imageData;
      this.copyImageUrl(images[this.currentImageIndex].url);
    });

    // Navigation Buttons
    this.prevButton.addEventListener("click", () => this.navigateImage("prev"));
    this.nextButton.addEventListener("click", () => this.navigateImage("next"));

    // Close modal on outside click
    this.fullscreenModal.addEventListener("click", (e) => {
      if (e.target === this.fullscreenModal) {
        this.closeFullscreen();
      }
    });
  }
}

// Initialize Gallery when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  window.gallery = new InfinityGallery();
});

document.addEventListener("DOMContentLoaded", () => {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  // Function to check if user is near the bottom of the page
  function checkScroll() {
    // Adjust the threshold as needed (e.g., within 300px of the bottom)
    const isNearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

    // Show/hide button based on scroll position
    if (window.scrollY > 300 || isNearBottom) {
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.classList.remove("show");
    }
  }

  // Smooth scroll to top
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Add scroll event listener
  window.addEventListener("scroll", checkScroll);
});
