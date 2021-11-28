console.clear()

// Get the canvas element from the DOM
const canvas = document.querySelector('#scene')
canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight
// Store the 2D context
const ctx = canvas.getContext('2d')

if (window.devicePixelRatio > 1) {
  canvas.width = canvas.clientWidth * 2
  canvas.height = canvas.clientHeight * 2
  ctx.scale(2, 2)
}

/* ====================== */
/* ====== VARIABLES ===== */
/* ====================== */
let width = canvas.clientWidth // 画布宽度
let height = canvas.clientHeight // 画布高度
let rotation = 0 // 地球的旋转
let dots = [] // 数组中的每个点

/* ====================== */
/* ====== CONSTANTS ===== */
/* ====================== */
/* Some of those constants may change if the user resizes their screen but I still strongly believe they belong to the Constants part of the variables */
const DOTS_AMOUNT = 10000 // 屏幕上的点数
const DOT_RADIUS = 1 // 点的半径
let GLOBE_RADIUS = width * 0.7 // 地球的半径
let GLOBE_CENTER_Z = -GLOBE_RADIUS // 地球中心的z轴
let PROJECTION_CENTER_X = width / 2 // 画布 HTML 的 X 中心
let PROJECTION_CENTER_Y = height / 2 // 画布 HTML 的 Y 中心
let FIELD_OF_VIEW = width * 0.8

class Dot {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z

    this.xProject = 0
    this.yProject = 0
    this.sizeProjection = 0
  }
  // 做一些数学运算将 3D 位置投影到 2D 画布中
  project(sin, cos) {
    const rotX = cos * this.x + sin * (this.z - GLOBE_CENTER_Z)
    const rotZ =
      -sin * this.x + cos * (this.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z
    this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ)
    this.xProject = rotX * this.sizeProjection + PROJECTION_CENTER_X
    this.yProject = this.y * this.sizeProjection + PROJECTION_CENTER_Y
  }

  // 在画布上绘制点
  draw(sin, cos) {
    this.project(sin, cos)
    ctx.beginPath()
    ctx.arc(
      this.xProject,
      this.yProject,
      DOT_RADIUS * this.sizeProjection,
      0,
      Math.PI * 2
    )
    ctx.closePath()
    ctx.fill()
  }
}
//不填冲数组
function createDots() {
  // 清空点阵
  // dots.length = 0

  // 根据所需数量创建一个新点
  for (let i = 0; i < DOTS_AMOUNT; i++) {
    const theta = Math.random() * 2 * Math.PI // Random value between [0, 2PI]
    const phi = Math.acos(Math.random() * 2 - 1) // Random value between [-1, 1]

    // 计算点沿地球的 [x, y, z] 坐标
    const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
    const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
    const z = GLOBE_RADIUS * Math.cos(phi) + GLOBE_CENTER_Z
    dots.push(new Dot(x, y, z))
  }
}

/* ====================== */
/* ======== RENDER ====== */
/* ====================== */
function render(a) {
  // Clear the scene
  ctx.clearRect(0, 0, width, height)

  // Increase the globe rotation
  rotation = a * 0.0004

  const sineRotation = Math.sin(rotation) // 旋转的正弦
  const cosineRotation = Math.cos(rotation) // 旋转余弦

  // 循环遍历点数组并绘制每个点
  for (let i = 0; i < dots.length; i++) {
    dots[i].draw(sineRotation, cosineRotation)
  }

  window.requestAnimationFrame(render)
}

// 用户调整屏幕大小后调用的函数
function afterResize() {
  width = canvas.offsetWidth
  height = canvas.offsetHeight
  if (window.devicePixelRatio > 1) {
    canvas.width = canvas.clientWidth * 2
    canvas.height = canvas.clientHeight * 2
    ctx.scale(2, 2)
  } else {
    canvas.width = width
    canvas.height = height
  }
  GLOBE_RADIUS = width * 0.7
  GLOBE_CENTER_Z = -GLOBE_RADIUS
  PROJECTION_CENTER_X = width / 2
  PROJECTION_CENTER_Y = height / 2
  FIELD_OF_VIEW = width * 0.8

  createDots() // Reset all dots
}

// 用于存储用户调整屏幕大小时超时的变量
let resizeTimeout
// 用户调整屏幕大小后立即调用的函数
function onResize() {
  // Clear the timeout variable
  resizeTimeout = window.clearTimeout(resizeTimeout)
  //存储新的超时时间以避免为每个调整大小事件调用 afterResize
  resizeTimeout = window.setTimeout(afterResize, 500)
}
window.addEventListener('resize', onResize)

// 用随机点填充点数组
createDots()

// 渲染场景
window.requestAnimationFrame(render)
