const columns: ColumnsType<Data> = [
  // ...existing code...
  {
    title: "Tehvil alindi",
    key: "tehvilAlindi",
    render: () => <Checkbox />,
  },
  {
    title: "Qaytarılma",
    dataIndex: "returnRequest",
    key: "returnRequest",
    render: (checked: boolean, record: Data) => (
      <Checkbox
        checked={checked}
        onChange={(e) => confirmCheckboxChange(record, e.target.checked)}
      />
    ),
  },
  {
    title: "Musteru melumatlari",
    key: "musteruMelumatlari",
    render: () => (
      <div>
        <label>Məlumat:</label>
        <Input style={{ marginBottom: 8 }} />
        <textarea style={{ width: "100%" }} rows={3}></textarea>
      </div>
    ),
  },
  // ...existing code...
];
