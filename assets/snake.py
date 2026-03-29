import pygame
import random
from abc import ABC, abstractmethod

# Settings for the game
WIDTH, HEIGHT = 800, 600
FOOD_SIZE = 20
SNAKE_SIZE = 20
FPS = 10

# Singleton pattern for the game manager
class GameManager:
    _instance = None

    @staticmethod
    def get_instance():
        if GameManager._instance is None:
            GameManager()
        return GameManager._instance

    def __init__(self):
        if GameManager._instance is not None:
            raise Exception("This class is a singleton!")
        else:
            GameManager._instance = self
            self.score = 0
            self.game_over = False
            self.score_saved = False
            self.objects = []
            self.init_objects()

    def init_objects(self):
        # Initializes or re-initializes the snake and food
        self.objects = [
            GameObjectFactory.create_object("snake", WIDTH // 2, HEIGHT // 2),
            GameObjectFactory.create_object("food", random.randint(0, WIDTH // FOOD_SIZE - 1) * FOOD_SIZE,
                                            random.randint(0, HEIGHT // FOOD_SIZE - 1) * FOOD_SIZE)
        ]

    def reset_game(self):
        self.score = 0
        self.game_over = False
        self.score_saved = False
        self.init_objects()
   
    def save_score(self):
        if not self.score_saved:
            with open("score.txt", "a") as file:
                file.write(f"{self.score}\n")
            self.score_saved = True

# Abstract class for game objects
class GameObject(ABC):
    def __init__(self, x, y, size):
        self.x = x
        self.y = y
        self.size = size

    @abstractmethod
    def draw(self, surface):
        pass

    @abstractmethod
    def update(self):
        pass

# Factory pattern for creating game objects
class GameObjectFactory:
    @staticmethod
    def create_object(type, x, y):
        if type == "snake":
            return Snake(x, y)
        elif type == "food":
            return Food(x, y)

# Snake class using encapsulation
class Snake(GameObject):
    def __init__(self, x, y):
        super().__init__(x, y, SNAKE_SIZE)
        self.body = [(x, y)]
        self.dx, self.dy = SNAKE_SIZE, 0

    def draw(self, surface):
        for segment in self.body:
            pygame.draw.rect(surface, (0, 255, 0), (segment[0], segment[1], self.size, self.size))

    def update(self):
        head_x, head_y = self.body[0]
        new_head = (head_x + self.dx, head_y + self.dy)
        if new_head in self.body or new_head[0] < 0 or new_head[0] >= WIDTH or new_head[1] < 0 or new_head[1] >= HEIGHT:
            GameManager.get_instance().game_over = True
            GameManager.get_instance().save_score()

        else:
            self.body.insert(0, new_head)
            if not GameManager.get_instance().objects[1].check_collision(new_head[0], new_head[1]):
                self.body.pop()

    def change_direction(self, dx, dy):
        self.dx, self.dy = dx, dy

# Food class
class Food(GameObject):
    def __init__(self, x, y):
        super().__init__(x, y, FOOD_SIZE)
        self.color = (255, 0, 0)

    def draw(self, surface):
        pygame.draw.rect(surface, self.color, (self.x, self.y, self.size, self.size))

    def update(self):
        pass

    def check_collision(self, x, y):
        if (x, y) == (self.x, self.y):
            self.x, self.y = random.randint(0, WIDTH//self.size - 1) * self.size, random.randint(0, HEIGHT//self.size - 1) * self.size
            GameManager.get_instance().score += 1
            return True
        return False

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Snake Game")
    clock = pygame.time.Clock()

    manager = GameManager.get_instance()

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if manager.game_over:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                    elif event.key == pygame.K_r:
                        manager.reset_game()
                else:
                    if event.key == pygame.K_UP and manager.objects[0].dy == 0:
                        manager.objects[0].change_direction(0, -SNAKE_SIZE)
                    elif event.key == pygame.K_DOWN and manager.objects[0].dy == 0:
                        manager.objects[0].change_direction(0, SNAKE_SIZE)
                    elif event.key == pygame.K_LEFT and manager.objects[0].dx == 0:
                        manager.objects[0].change_direction(-SNAKE_SIZE, 0)
                    elif event.key == pygame.K_RIGHT and manager.objects[0].dx == 0:
                        manager.objects[0].change_direction(SNAKE_SIZE, 0)

        screen.fill((0, 0, 0))
        for obj in manager.objects:
            obj.draw(screen)
            obj.update()

        # Display the current score
        font = pygame.font.SysFont(None, 36)
        score_text = font.render(f"Score: {manager.score}", True, (255, 255, 255))
        screen.blit(score_text, (10, 10))  # Top left corner

        if manager.game_over:
            font = pygame.font.SysFont(None, 72)
            text = font.render(f"Game Over! Score: {manager.score}", True, (255, 255, 255))
            screen.blit(text, (WIDTH // 2 - text.get_width() // 2, HEIGHT // 2 - text.get_height() // 2))
            restart_text = font.render("Press 'R' to Restart  'Esc' to Exit", True, (255, 255, 255))
            screen.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + text.get_height()))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()

if __name__ == "__main__":
    main()