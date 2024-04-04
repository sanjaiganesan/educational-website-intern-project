import os
import time
import traceback
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
def test_login(driver):
    try:
        # Open the login page
        driver.get("http://52.200.65.240:3000/login")
        
        # Find the username and password input fields and enter the values with a delay
        time.sleep(2)
        username_input = driver.find_element(By.ID, "email")
        password_input = driver.find_element(By.ID, "password")

        username_input.send_keys("siva@gmail.com")
        password_input.send_keys("Siva123@")

        form_check = driver.find_element(By.ID, "checkbox")
        form_check.click()

        login_button = driver.find_element(By.CSS_SELECTOR, ".Loginbutton")
        login_button.click()
        print("Login Successfully") 

        # Wait for the login to complete
        WebDriverWait(driver, 10).until(EC.url_to_be("http://52.200.65.240:3000/main/home"))

        # Redirect to Practice Page
        time.sleep(10)
        practice_page_link = driver.find_element(By.LINK_TEXT, "Educators")
        practice_page_link.click()
        print("Redirected to Educators Page")

        # Redirect to  Page
        time.sleep(10)
        practice_page_link = driver.find_element(By.LINK_TEXT, "Course")
        practice_page_link.click()
        print("Redirected to course Page")

        # Wait for the course page to load
        #WebDriverWait(driver, 10).until(EC.url_contains("http://52.200.65.240:3000/main/courses"))

        # Go to practice Page
        time.sleep(10)
         
        practice_page_link = driver.find_element(By.LINK_TEXT, "Practice")
        practice_page_link.click()
        print("Redirected to Practice Page")

        # Go to success stories  Page
        time.sleep(10)
        practice_page_link = driver.find_element(By.LINK_TEXT, "Success Stories")
        practice_page_link.click()
        print("Redirected to Success Stories Page")
        

         # Go to success stories  Page
        time.sleep(10)
        practice_page_link = driver.find_element(By.LINK_TEXT, "Contact Us")
        practice_page_link.click()
        print("Redirected to Contact Us Page")

        # Logout
        time.sleep(10)
        logout_button = driver.find_element(By.CLASS_NAME, "profile")
        logout_button.click()
        print("Logged out")

    except Exception as e:
        print("An error occurred during testing.")
        print(e)

    finally:
        # Close the browser
        driver.quit()



# Set the path to the Chrome driver executable as an environment variable
chrome_driver_path = "C:/Users/Dell/Documents/python-selenium/chromedriver.exe"
os.environ["PATH"] += os.pathsep + chrome_driver_path

# Initialize the Chrome driver
driver = webdriver.Chrome()

# Call the test_login function with the initialized driver
test_login(driver)