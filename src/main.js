
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import svgo from './svgo.config'
import webfontsGenerator from "webfonts-generator";

const config = {
  svgExt: '.svg',
  svgFolder: './svg/',
  optFolder: './svg/optimized/',
  webfont: './icons/'
}

const svgFilter = (file) => path.extname(file).toLowerCase() === config.svgExt;

const getFiles = (svgPath, withPath) => {
  if (withPath) {
    return fs.readdirSync(svgPath).map(item => svgPath + item).filter((svgFilter))
  } else {
    return fs.readdirSync(svgPath).filter((svgFilter))
  }
} 

const optFolderHandler = (optSvgPath, callback) => {
  (fs.existsSync(optSvgPath)) ? rimraf(optSvgPath, () => fs.mkdir(optSvgPath, callback())) : fs.mkdir(optSvgPath, callback())
}

const svgOptimizer = (svgPath = config.svgFolder, optSvgPath = config.optFolder) => {
  return new Promise((resolve, regect) => {
    optFolderHandler(optSvgPath, () => {
      getFiles(svgPath).forEach(file => {
        let svgFile = svgPath + file
        fs.readFile(svgFile, 'utf8', (err, data) => {
          if (err) throw err 
          svgo.optimize(data, { path: svgFile }).then((result) => {
            fs.writeFile(optSvgPath + file, result.data, (err) => (err) ? regect() : resolve('svg files are optimized!'))
          });
        })
      });
    }) 
  })
}

const generateWebfont = (svgPath, optSvgPath, fontName) => svgOptimizer(svgPath, optSvgPath).then(response => {
  console.log(response)
  webfontsGenerator({
    files: getFiles(config.optFolder, true),
    dest: config.webfont,
    fontName: fontName
  }, (error) => (error) ? console.log('Fail!', error) : console.log('web font was generated!'))
})

export default generateWebfont(config.svgFolder, config.optFolder)
