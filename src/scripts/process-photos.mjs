import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import sharp from 'sharp';
import heicDecode from 'heic-decode';
import exifr from 'exifr';
import crypto from 'crypto';

const RAW_DIR = path.join(process.cwd(), 'raw_photos');
const OUT_DIR = path.join(process.cwd(), 'public', 'photos');
const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'gallery.json');
const META_FILE = path.join(RAW_DIR, 'meta.json');

async function processPhotos() {
  console.log('开始处理图片...');
  
  // 确保目录存在，并清空旧的相册输出目录避免改名后留下大量没用的孤儿文件
  await fs.mkdir(RAW_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  
  // 清理目录内文件
  const oldFiles = await fs.readdir(OUT_DIR);
  for (const f of oldFiles) {
    if (f.endsWith('.webp')) await fs.unlink(path.join(OUT_DIR, f));
  }

  // 读取原图目录
  const files = await fs.readdir(RAW_DIR);
  const imageFiles = files.filter(f => /\.(jpe?g|png|webp|gif|heic)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log('raw_photos 目录下没有找到图片。请放入原图后重试。');
    // 创建一个示例 meta.json
    if (!fsSync.existsSync(META_FILE)) {
      await fs.writeFile(META_FILE, JSON.stringify({
        "example.jpg": {
          "title": "这是一张示例图片",
          "description": "这里可以写很长的备注...",
          "date": "2024-01-28",
          "location": "上海, 新天地"
        }
      }, null, 2));
    }
    return;
  }

  // 尝试读取 meta.json 获取备注
  let meta = {};
  if (fsSync.existsSync(META_FILE)) {
    meta = JSON.parse(await fs.readFile(META_FILE, 'utf-8'));
  }

  const galleryData = [];

  for (const file of imageFiles) {
    const ext = path.extname(file);
    const basename = path.basename(file, ext);
    
    const inputPath = path.join(RAW_DIR, file);

    // 尝试提取 EXIF 日期信息和 GPS 坐标
    let autoDate = '';
    let autoLocation = '';
    try {
      const exifData = await exifr.parse(inputPath);
      
      const rawDate = exifData?.DateTimeOriginal || exifData?.CreateDate;
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          autoDate = d.toISOString().split('T')[0]; // 提取 YYYY-MM-DD
        }
      }

      // 如果成功提取到经纬度
      if (exifData?.latitude && exifData?.longitude) {
        autoLocation = `${exifData.latitude.toFixed(4)}, ${exifData.longitude.toFixed(4)}`;
      }
    } catch (err) {
      // 解析忽略不支持或无 EXIF 的文件
    }

    // 优化：采用 "日期-哈希" 结构生成文件，极其干净 (如 20240128-a1b2c3d4.webp)
    const datePrefix = autoDate ? `${autoDate.replace(/-/g, '')}-` : 'nodate-';
    const hashStr = crypto.createHash('md5').update(file).digest('hex').slice(0, 8);
    const webpName = `${datePrefix}${hashStr}.webp`;
    const outputPath = path.join(OUT_DIR, webpName);

    console.log(`正在压缩: ${file} -> ${webpName}`);
    
    try {
      if (ext.toLowerCase() === '.heic') {
        const buffer = await fs.readFile(inputPath);
        const { width, height, data } = await heicDecode({ buffer });
        
        await sharp(Buffer.from(data), {
          raw: { width, height, channels: 4 }
        })
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);
      } else {
        // 使用 sharp 压缩其他图片：最大宽度 1200，转换为 80% 质量的 webp
        await sharp(inputPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);
      }
    } catch (err) {
      console.error(`❌ 处理图片 ${file} 失败:`, err.message);
      continue;
    }

    // 获取对应的备注信息（如果没有，则默认标题留空，不显示冗长的文件名）
    const fileMeta = meta[file] || {};
    galleryData.push({
      src: `/photos/${webpName}`,
      alt: fileMeta.title || '', // 默认不填充文件名，作为装饰图
      description: fileMeta.description || '',
      date: fileMeta.date || autoDate || '', // 优先使用手动备注的日期，否则使用 EXIF 提取出的日期
      location: fileMeta.location || autoLocation || '', // 优先使用手写的地点名，否则记录照片 EXIF 给出的经纬度
      rawGPS: autoLocation ? true : false // 标记这是否是一个未经转译的经纬度字符串，前端也许可以用来跳转地图
    });
  }

  // 将整理好的数据写入 JSON，供前端页面读取
  await fs.writeFile(DATA_FILE, JSON.stringify(galleryData, null, 2));
  console.log(`✅ 图片处理完成！共处理了 ${imageFiles.length} 张图片。`);
  console.log(`👉 页面数据已存至: src/data/gallery.json`);
}

processPhotos().catch(console.error);
