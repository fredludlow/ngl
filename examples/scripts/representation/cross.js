stage.loadFile('data://1blu.pdb').then(function (o) {
  o.addRepresentation('line')
  o.addRepresentation('cross', {
    sele: 'water'
  })
  o.autoView()
})
