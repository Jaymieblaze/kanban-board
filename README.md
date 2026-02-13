# 📋 Kanban Board

A modern, feature-rich Kanban board application built with React, featuring drag-and-drop functionality, task management, dark mode, and responsive design.

## ✨ Features

### Task Management
- **Drag & Drop** - Intuitive task reordering within and across columns using dnd-kit
- **Rich Task Details** - Add descriptions, priority levels, due dates, and tags
- **Task Search** - Real-time search across task titles, descriptions, and tags
- **Priority Levels** - Categorize tasks as low, medium, or high priority with visual indicators
- **Due Date Tracking** - Set deadlines with automatic overdue detection
- **Tag System** - Organize tasks with customizable tags

### Column Management
- **Dynamic Columns** - Create, rename, and delete columns
- **Column Pagination** - View 4 columns at a time on desktop with smooth navigation
- **Task Counters** - See task count per column at a glance

### User Interface
- **Dark Mode** - Toggle between light and dark themes with localStorage persistence
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices
- **Mobile-First** - Horizontal scroll on mobile, hamburger menu for statistics
- **Glass-morphism** - Modern, translucent design with backdrop blur effects
- **Smooth Animations** - Polished transitions and hover effects

### Statistics Dashboard
- **Real-time Stats** - Track total tasks, completed tasks, and overdue items
- **Mobile Stats Panel** - Collapsible statistics menu for small screens
- **Visual Indicators** - Color-coded badges for quick status recognition

### Data Persistence
- **LocalStorage** - Automatic saving of columns, tasks, and user preferences
- **State Recovery** - Restore your board exactly as you left it

## 🚀 Tech Stack

- **React 19.2.0** - Modern React with hooks (useState, useEffect, useMemo)
- **Vite 7.3.1** - Lightning-fast build tool and dev server
- **Tailwind CSS 4.1.18** - Utility-first CSS framework with custom theme
- **@dnd-kit** - Modern drag-and-drop toolkit for React
- **Lucide React** - Beautiful, consistent icon library
- **LocalStorage API** - Client-side data persistence

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kanban-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🎯 Usage

### Managing Columns
- **Create Column**: Click the "+ Add Column" button at the end of your board
- **Rename Column**: Click on the column title to edit it inline
- **Delete Column**: Click the trash icon in the column header (removes all tasks in that column)
- **Navigate Columns**: Use pagination arrows on desktop to view additional columns

### Managing Tasks
- **Create Task**: Click "+ Add task" button at the bottom of any column
- **Edit Task**: Click on any task card to open the detailed editor modal
- **Move Tasks**: Drag and drop tasks between columns or reorder within a column
- **Delete Task**: Click trash icon while hovering over a task, or use delete button in edit modal
- **Add Tags**: Type tag name and press Enter or click "Add" button
- **Remove Tags**: Click the X icon next to any tag

### Search & Filter
- **Search Tasks**: Use the search bar in the header to filter tasks by content
- **Clear Search**: Click the X icon in the search bar

### Dark Mode
- **Toggle Theme**: Click the moon/sun icon in the header
- **Automatic Persistence**: Your theme preference is saved automatically

### Mobile Navigation
- **View Stats**: Click the hamburger menu icon to see statistics
- **Scroll Columns**: Swipe horizontally to navigate between columns
- **Touch Optimized**: All buttons are sized for easy tap targets

## 📁 Project Structure

```
kanban-board/
├── public/           # Static assets
├── src/
│   ├── components/
│   │   ├── ColumnContainer.jsx   # Column component with drag-drop
│   │   └── TaskCard.jsx          # Task card with edit modal
│   ├── App.jsx       # Main application component
│   ├── App.css       # Global styles
│   ├── index.css     # Tailwind imports and custom CSS
│   └── main.jsx      # Application entry point
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── vite.config.js    # Vite configuration
├── tailwind.config.js # Tailwind dark mode config
└── eslint.config.js  # ESLint configuration
```

## 🎨 Design Features

### Color Scheme
- **Light Mode**: Purple/Indigo gradient with clean whites
- **Dark Mode**: Gray scale (900/800/700) with purple accents

### Priority Colors
- **Low**: Blue badges and borders
- **Medium**: Yellow/amber badges and borders
- **High**: Red badges and borders

### Responsive Breakpoints
- **Mobile**: < 768px (horizontal scroll, hamburger menu)
- **Tablet**: 768px - 1024px (column pagination starts)
- **Desktop**: > 1024px (full stats display, 4 columns per page)

## 🔧 Configuration

### LocalStorage Keys
- `kanban-columns` - Stores column data
- `kanban-tasks` - Stores all tasks
- `kanban-dark-mode` - Stores theme preference

### Default Data
The app comes with sample data:
- 3 default columns: "Todo", "In Progress", "Done"
- 3 sample tasks with various priority levels and features

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with modern React patterns and best practices, inspired by popular project management tools like Trello, Linear, and Asana.

---

**Made with ❤️ using React + Vite**
