var ue = UE.getEditor('editor', {
  toolbars: [['FullScreen', 'undo', 'redo', '|', 'bold', 'italic', '|']],
  review: {
    enable: true,
    user: 'sun',
    users: {
      sun: { color: 'red' },
      veiky: { color: 'blue' },
      soonwait: { color: 'green' }
    }
  }
});