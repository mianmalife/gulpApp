const array = ['React', 'Vue', 'Angular']
const helloworld = () => {
  const maps = new Map()
  for(let key of array) {
    maps.set(key, Math.random())
  }
  return maps
}

const h = helloworld()
console.log(h.get('React'))