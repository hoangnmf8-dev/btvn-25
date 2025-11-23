const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const slideShowEl = $("#my-slideshow");
const trackEl = $(".track");
const dottedEl = $(".dotted");

const slideShowApp = {
  currentImg: 0,
  initPosition: 0,
  isDrag: false,
  currentTranslate: 0,
  mouseMoveDistance: 0,
  idInterval: 0,
  isActive: true,
  dataImgs: [
    {
      id: 1,
      src: "https://bigpicturesb.org/wp-content/uploads/2024/10/anh-nen-mu-62.jpeg",
      alt: "Ảnh nền MU",
    },
    {
      id: 2,
      src: "https://mega.com.vn/media/news/0206_hinh-nen-MU-may-tinh4.jpg",
      alt: "Hình nền MU máy tính",
    },
    {
      id: 3,
      src: "https://nguoiduatin.mediacdn.vn/media/than-anh-viet/2021/11/09/2498175766818106927955795060127560741084848n.jpg",
      alt: "Đội hình MU mùa 2021-2022",
    },
    {
      id: 4,
      src: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/06/tong-hop-hinh-anh-manchester-united-an-tuong-nhat-27.jpg",
      alt: "Tổng hợp hình ảnh MU ấn tượng nhất",
    },
  ],

  updateLayoutOnResize() {
    const trackWidth = this.getTrackWidth();
    trackEl.style.transition = "none";
    trackEl.style.transform = `translateX(${
      -(this.currentImg + 1) * trackWidth
    }px)`;
  },

  getTrackWidth() {
    return document.documentElement.clientWidth;
  },

  escapeHTML(value) {
    const div = document.createElement("div");
    const text = document.createTextNode(value);
    div.appendChild(text);
    return div.innerHTML;
  },

  renderImg() {
    const dataImgsClone = this.dataImgs.slice(0);
    const firstImg = {...this.dataImgs[0]};
    const lastImg = {...this.dataImgs[this.dataImgs.length - 1]};
    firstImg.id = this.dataImgs.length + 1;
    dataImgsClone.push(firstImg);
    dataImgsClone.unshift(lastImg);
    trackEl.style.transform = `translateX(-${this.getTrackWidth()}px)`;
    let imgsStr = dataImgsClone
      .map(
        (img, index) => `
        <li class="slide shrink-0 w-full h-[500px]" data-img="${index - 1}"> 
          <img class="block w-full h-full object-cover" src="${this.escapeHTML(
            img.src
          )}" alt="${this.escapeHTML(img.alt)}" />
        </li>
      `
      )
      .join("");
    trackEl.innerHTML = imgsStr;

    let dottedStr = this.dataImgs
      .map(
        (img, index) => `
      <li class="dotted-item transition-colors duration-300 ${
        index === 0 ? "active" : ""
      }" data-dotted="${index}"></li>
    `
      )
      .join("");
    dottedEl.innerHTML = dottedStr;
  },

  updateDotted(lastImg = null) {
    $$(".dotted-item").forEach((item, index) => {
      item.classList.remove("active");
      if (index === this.currentImg % this.dataImgs.length || index === lastImg) {
        //Khi đến ảnh fake thì currentImg = dataImgs.length nên chia dư = 0 sẽ set ngay màu cho dot đầu tiên, tránh bị delay vì dot cũng có transition
        item.classList.add("active");
      }
    });
  },

  throttlingClick() {
    if(!this.isActive) return true;
    this.isActive = false;
    setTimeout(() => {
      this.isActive = true;
    }, 400);
  },

  nextImg(id = undefined) {
    if(this.throttlingClick()) return;
    const trackWidth = this.getTrackWidth();
    trackEl.style.transition = "transform .3s";
    let nextIndex = id !== undefined ? id : this.currentImg + 1;

    trackEl.style.transform = `translateX(-${
      this.getTrackWidth() + nextIndex * trackWidth
    }px)`;

    this.currentImg = nextIndex;

    this.updateDotted();

    //Xử lý infinite carousel next
    if (this.currentImg === this.dataImgs.length) {
      setTimeout(() => {
        trackEl.style.transition = "none";
        trackEl.style.transform = `translateX(-${this.getTrackWidth()}px)`; //di chuyển đến ảnh fake
        this.currentImg = 0;
        this.updateDotted();
      }, 350);
    }
  },

  backImg(id = undefined) {
    if(this.throttlingClick()) return;
    const trackWidth = this.getTrackWidth();
    trackEl.style.transition = "transform .3s";
    let prevIndex = id !== undefined ? id : this.currentImg - 1;
    trackEl.style.transform = `translateX(-${
      prevIndex * trackWidth + trackWidth
    }px)`;
    this.currentImg = prevIndex;
    this.updateDotted();

    if (prevIndex < 0) {
      //Xử lý infinite carousel previous
      trackEl.style.transform = `translateX(0px)`; //Di chuyển đến ảnh fake

      setTimeout(() => {
        trackEl.style.transition = "none";
        this.currentImg = this.dataImgs.length - 1;
        trackEl.style.transform = `translateX(-${
          this.currentImg * trackWidth + this.getTrackWidth()
        }px)`;
      }, 350);
      this.updateDotted(this.dataImgs.length - 1);
      return;
    }
  },

  handleMouseDown(e) {
    e.preventDefault(); //Ngăn chặn hành vi mặc định chọn hình ảnh
    // Tránh bắt đầu kéo khi click vào các nút điều khiển
    if (e.target.closest(".controls-btn") || e.target.matches(".dotted-item")) {
      return;
    }
    if (e.button === 0) {
      this.isDrag = true;
      slideShowEl.classList.add("cursor-grabbing");
    }
    this.initPosition = e.clientX;
    // Lấy vị trí dịch chuyển ban đầu dựa trên chiều rộng động
    this.currentTranslate = -(this.currentImg + 1) * this.getTrackWidth();
  },

  handleMouseMove(e) {
    if (this.isDrag) {
      // Tắt transition khi kéo để đảm bảo mượt mà
      trackEl.style.transition = "none";
      this.mouseMoveDistance = e.clientX - this.initPosition;
      const newPosition = this.currentTranslate + this.mouseMoveDistance;
      trackEl.style.transform = `translateX(${newPosition}px)`;
    }
  },

  handleMouseUp(e) {
    if (!this.isDrag) return; // Đảm bảo chỉ chạy logic khi đang kéo
    this.isDrag = false;
    slideShowEl.classList.replace("cursor-grabbing", "cursor-default");

    const trackWidth = this.getTrackWidth();
    const percentMove = (Math.abs(this.mouseMoveDistance) / trackWidth) * 100;

    trackEl.style.transition = "transform 0.3s";

    if (this.mouseMoveDistance < 0 && percentMove >= 20) {
      this.nextImg();
    } else if (this.mouseMoveDistance > 0 && percentMove >= 20) {
      this.backImg();
    } else {
      trackEl.style.transform = `translateX(-${
        this.currentImg * trackWidth + this.getTrackWidth()
      }px)`;
    }
    this.mouseMoveDistance = 0;
    this.percentMove = 0;
  },

  handleAction(e) {
    if (e.target.matches(".fa-chevron-right") || e.target.closest(".next")) {
      //tăng khả năng bấm trúng vào icon và nút next
      this.nextImg();
    } else if (
      e.target.matches(".fa-chevron-left") ||
      e.target.closest(".back")
    ) {
      this.backImg();
    } else if (e.target.matches(".dotted-item")) {
      const id = +e.target.dataset.dotted;
      if (id !== this.currentImg) {
        if (id > this.currentImg) {
          this.nextImg(id);
        } else {
          this.backImg(id);
        }
      }
    }
  },
};

slideShowApp.renderImg();

slideShowEl.addEventListener(
  "click",
  slideShowApp.handleAction.bind(slideShowApp) //this trong callback của event tham chiếu đến đối tượng window nên phải bind để lấy this của obj slideShowApp để sử dụng this trong các hàm cho đúng.
);

//Kéo thả, tạo auto next
slideShowEl.addEventListener("mousedown", (e) => {
  if (e.target) {
    //Khi thực hiện các sự kiện liên quan đến mouse down phải tắt interval, nếu chỉ có next/prev thì sẽ interval ngay khi kéo thả, giảm trải nghiệm người dùng
    clearInterval(slideShowApp.idInterval);
  }
  slideShowApp.handleMouseDown.bind(slideShowApp)(e);
});

document.addEventListener(
  "mousemove",
  slideShowApp.handleMouseMove.bind(slideShowApp)
);

document.addEventListener("mouseup", (e) => {
  if (e.target) {
    //Khi thực hiện các sự kiện liên quan đến mouse up thì bật interval
    slideShowApp.idInterval = setInterval(
      slideShowApp.nextImg.bind(slideShowApp),
      1500
    );
  }
  slideShowApp.handleMouseUp.bind(slideShowApp)(e);
});

//Khởi tạo auto next chạy đầu tiên
slideShowApp.idInterval = setInterval(
  slideShowApp.nextImg.bind(slideShowApp),
  1500
);

window.addEventListener(
  "resize",
  slideShowApp.updateLayoutOnResize.bind(slideShowApp)
);
