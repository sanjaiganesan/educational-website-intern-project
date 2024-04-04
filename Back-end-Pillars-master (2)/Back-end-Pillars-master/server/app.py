import os
import random
from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import cross_origin
import psycopg2
import jwt
from functools import wraps
from datetime import datetime,timedelta
from flask_mail import Mail,Message

app = Flask(__name__)
load_dotenv()

# Gmail connection parameters
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = os.getenv('MAIL_PORT')
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

# PostgreSQL connection parameters
def connection():
    conn = psycopg2.connect(
        host= os.getenv('HOST'),
        database= os.getenv('DATABASE'),
        user= os.getenv('USER'),
        password= os.getenv('PASSWORD')
    )
    return conn

def authorization(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token = request.args.get('apikey')
        if not token:
            return jsonify({"status":"token is missing"})
        try:
            data = jwt.decode(token, os.getenv('SECRET_KEY'),algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"status":"Token has expired"})
        except jwt.InvalidTokenError as e:
            return jsonify("Invalid token:", e)
        except Exception as e:
            return jsonify("Unexpected error:", e)

        
        return f(*args,**kwargs)
    return decorated

@app.route('/login', methods=["POST"])
@cross_origin(origins='*')
def login():
    conn = connection()
    if request.method == "POST":
        user = request.get_json()
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM user_table WHERE email = '{user['email']}' AND password = '{user['password']}'")
        
        account = cursor.fetchone()
        if account:
            # Update the last login date for the user
            last_login = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute('UPDATE user_table SET last_login_date = %s WHERE user_id = %s', (last_login, account[0]))
            conn.commit()

            token = jwt.encode({
            'public_id': account[0],
            'username':account[1],
            'email': account[2],
            'image':account[7],
            'role': account[4],
            'exp' : datetime.utcnow() + timedelta(minutes = 30)}, os.getenv('SECRET_KEY'))

            response = {'API_Key':token }
        else:
            response = {"status": "Invalid username or password"}

        cursor.close()
        conn.close()
        return jsonify(response)


@app.route('/register', methods=["POST"])
@cross_origin(origins='*')
def signup():
    conn = connection()
    if request.method == "POST":
        user = request.get_json()
        cursor = conn.cursor()

        # Check if the email already exists
        cursor.execute('SELECT * FROM user_table WHERE email = %s', (user['email'],))
        account = cursor.fetchone()
        if account:
            return jsonify({"status": "User already exists"})

        # Get the current registration date and time
        registration_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # Insert the new user into the database
        cursor.execute(f"INSERT INTO user_table (username, email, password, role, registration_date,last_login_date,image) VALUES('{user['username']}', '{user['email']}', '{user['password']}', 'Student', '{registration_date}','{registration_date}', '{user['image']}')")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"})

@app.route('/user',methods=["GET","PUT"])
@authorization
@cross_origin(origins='*')
def user():
    if request.method == "GET":
        #Process user data via token
        token = request.args.get('apikey')
        data = jwt.decode(token, os.getenv('SECRET_KEY'),algorithms=["HS256"])
        return jsonify(data)
    if request.method == "PUT":
        user_id = request.form['user_id']
        username = request.form['username']
        email = request.form['email']
        image = request.form['image']
        conn = connection()
        cursor = conn.cursor()
        cursor.execute(f"UPDATE user_table SET username='{username}',email='{email}',image='{image}' WHERE user_id = {user_id}")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status':'updated'})

@app.route('/users' , methods=["GET","POST","PUT","DELETE"])
@authorization
@cross_origin(origins='*')
def users():
    conn = connection()
    if request.method == "GET":
        cursor = conn.cursor()
        cursor.execute("SELECT * from user_table ORDER BY role")
        users = cursor.fetchall()

        user_list = []

        for user in users:
            u = {}
            u['user_id'] = user[0]
            u['username'] = user[1]
            u['email'] = user[2]
            u['role'] = user[4]
            u['registration_date'] = user[5]
            u['last_login'] = user[6]
            u['image'] = user[7]
            user_list.append(u)

        return jsonify(user_list)
    
    if request.method == "PUT":
        user = request.get_json()
        cursor = conn.cursor()
        cursor.execute(f"UPDATE user_table SET role = '{user['role']}' WHERE email = '{user['email']}'")
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"status" : "Updated"})
    
    if request.method == "DELETE":
        email = request.args.get('email')
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM user_table WHERE email = '{email}'")
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"status":"Deleted"})





@app.route('/educators',methods=["GET","POST","PUT","DELETE"])
@authorization
@cross_origin(origins='*')
def educators():
    conn = connection()
    if request.method == "GET":
        cursor = conn.cursor()
        #Getting list of educators from the database
        cursor.execute("select u.user_id,u.username,u.email,e.subjects,u.image from educator_table as e join user_table as u on e.email = u.email where u.role = 'teacher' order by u.username")
        educators_list = cursor.fetchall()
        educators = []
        if not educators_list:
            return jsonify({"status":"None"})
        for e in educators_list:
            educator = {}
            educator['user_id'] = e[0]
            educator['username'] = e[1]
            educator['email'] = e[2]
            educator['subjects'] = e[3]
            educator['image'] = e[4]
            educators.append(educator)
        
        cursor.close()
        conn.close()
        return jsonify(educators)
    
    if request.method == "POST":
        educator = request.get_json()
        cursor = conn.cursor()
        
        # Check if the educator already exists
        cursor.execute(f"SELECT * FROM user_table WHERE email = '{educator['email']}'")
        existing_educator = cursor.fetchone()
        if existing_educator:
            cursor.execute(f"SELECT * FROM educator_table WHERE email = '{educator['email']}'")
            existing_educator = cursor.fetchone()
            if existing_educator:
                return jsonify({"status":"Already exists"})
            cursor.execute(f"UPDATE user_table SET role = 'teacher' WHERE email = '{educator['email']}'")
            # Insert the new educator into the database
            cursor.execute(f"INSERT INTO educator_table (email, biography, subjects) VALUES ('{educator['email']}', '{educator['biography']}',ARRAY{educator['subjects']})")
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status": "Inserted"})
        
        return jsonify({"status": "User not Found"})
    
    if request.method == "PUT":
        educator = request.get_json()
        cursor = conn.cursor()
        
        # Update educator's subjects
        cursor.execute(f"UPDATE educator_table SET subjects = ARRAY {educator['subjects']} WHERE email = '{educator['email']}'")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "Updated"})
    
    if request.method == "DELETE":
        educator_email = request.args.get('email')
        cursor = conn.cursor()
        # Delete the educator from both user_table and educator_table
        # cursor.execute(f"DELETE FROM user_table WHERE email = '{educator_email}'")
        cursor.execute(f"UPDATE user_table SET role = 'Student' WHERE email = '{educator_email}'")
        cursor.execute(f"DELETE FROM educator_table WHERE email = '{educator_email}'")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "Deleted"})


@app.route('/quiz',methods=["GET","POST","PUT","DELETE"])
@authorization
@cross_origin(origins='*')
def quiz():
        conn = connection()
        if request.method == "GET":
            cursor = conn.cursor()
            # Getting the quiz from the database 
            cursor.execute("SELECT * FROM quiz_table")
            quiz_list = cursor.fetchall()
            quiz = []
            if not quiz_list:
                return jsonify({'error': 'Quiz not found'})
            for q in quiz_list:
                que = {}
                que['quiz_id'] = q[0]
                que['course_id'] = q[1]
                que['quiz_title'] = q[2]
                que['quiz_description'] = q[3]
                quiz.append(que)

            cursor.close()
            conn.close()
            return jsonify(quiz)
        
        if request.method == "POST":
            quiz = request.get_json()
            cursor = conn.cursor()
            # Adding the quiz in database 
            cursor.execute(f"INSERT INTO quiz_table (course_id,quiz_title,quiz_description) VALUES ('{quiz['course_id']}','{quiz['quiz_title']}','{quiz['quiz_description']}')")
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status":"Inserted"})
        
        if request.method == "PUT":
            quiz = request.get_json()
            cursor = conn.cursor()
            # Update the quiz in the database
            cursor.execute(f"UPDATE quiz_table SET quiz_id = '{quiz['quiz_id']}', course_id = '{quiz['course_id']}', quiz_title = '{quiz['quiz_title']}', quiz_description = '{quiz['quiz_description']}' WHERE quiz_id = '{quiz['old_quiz_id']}'")
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status":"Updated"})
        
        if request.method == "DELETE":
            quiz_id = request.args.get('quiz_id')
            cursor = conn.cursor()
            cursor.execute(f"DELETE FROM question_table WHERE quiz_id = {quiz_id}")
            conn.commit()
            # Delete the quiz in database
            cursor.execute(f"DELETE FROM quiz_table WHERE quiz_id = {quiz_id}")
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"status":"Deleted"})


@app.route('/quiz/<int:quiz_id>', methods=["GET","POST","PUT","DELETE"])
@authorization
@cross_origin(origins='*')
def update_quiz(quiz_id):
    conn = connection()
    if request.method == "GET":
        cursor = conn.cursor()
        #Getting Quiz from database
        cursor.execute(f"select ques.question_id,quiz.quiz_id,quiz.course_id,quiz.quiz_title,ques.question_text,ques.question_options,ques.correct_answer from quiz_table as quiz join question_table as ques on quiz.quiz_id = cast(ques.quiz_id as integer) where quiz.quiz_id = {quiz_id}")
        quiz_list = cursor.fetchall()
        quiz = []
        if not quiz_list:
            return jsonify({'error': 'No questions added'})
        
        for q in quiz_list:
            que = {}
            que['question_id'] = q[0]
            que['quiz_id'] = q[1]
            que['course_id'] = q[2]
            que['quiz_title'] = q[3]
            que['question_text'] = q[4]
            que['question_options'] = q[5]
            que['correct_answer'] = q[6]
            quiz.append(que)
        
        cursor.close()
        conn.close()
        return jsonify(quiz)
    
    if request.method == "POST":
        ques = request.get_json()
        cursor = conn.cursor()
        # Insert the quiz in the database
        cursor.execute(f"INSERT INTO question_table (quiz_id,question_text,question_options,correct_answer) VALUES({quiz_id},'{ques['question_text']}', ARRAY {ques['question_options']}, '{ques['correct_answer']}')")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status":"Inserted"})
    
    if request.method == "PUT":
        ques = request.get_json()
        cursor = conn.cursor()
        # Update the quiz in the database
        cursor.execute(f"UPDATE question_table SET quiz_id = {ques['quiz_id']},question_text = '{ques['question_text']}',question_options = ARRAY {ques['question_options']}, correct_answer = '{ques['correct_answer']}' WHERE question_id = {ques['question_id']}")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status":"Updated"})
    
    if request.method == "DELETE":
        ques_id = request.args.get('question_id')
        cursor = conn.cursor()
        # Delete the quiz in the database
        cursor.execute(f"DELETE FROM question_table WHERE question_id = {ques_id}")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status":"Deleted"})

@app.route('/quiz/fileupload/<int:quiz_id>',methods=["POST"])
# @authorization
@cross_origin(origins="*")
def file_upload(quiz_id):
    if request.method == "POST":
        file = request.files['file']
        import pandas as pd
        dataframe = pd.read_csv(file)
        questions = list(dataframe.itertuples(index=True))
        questions_List = []
        for q in questions:
            question = {}
            question['question_text'] = q[2]
            question['question_options'] = q[3].split(",")
            question['correct_answer'] = q[4]
            questions_List.append(question)
        
        conn = connection()
        cursor = conn.cursor()
        for question in questions_List:
            cursor.execute(f"INSERT INTO question_table (quiz_id,question_text,question_options,correct_answer) VALUES ({quiz_id},'{question['question_text']}',ARRAY {question['question_options']},'{question['correct_answer']}')")
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'status':'Uploaded'})

@app.route('/quiz/evaluate/<int:quiz_id>', methods=["POST"])
@authorization
@cross_origin(origins="*")
def evaluate(quiz_id):
    conn = connection()
    answers = request.get_json()
    count = 0

    for answer in answers:
        cursor = conn.cursor()
        cursor.execute(f"SELECT correct_answer from question_table WHERE quiz_id = {quiz_id} and correct_answer = '{answer}'")
        correct_answer = cursor.fetchone()
        cursor.close()
        # Evaluting the quiz
        if correct_answer:
            count += 1

    
    result = count
    return jsonify(result)

@app.route('/courses', methods=["GET","POST"])
@authorization
@cross_origin(origins='*')
def courses():
    conn = connection()
    if request.method == "GET":
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM course_table')
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        response = [{"course_id": course[0],
                     "course_name": course[1],
                     "course_description": course[2],
                     "instructor_id": course[3],
                     "course_duration": course[4],
                     "enrollment_fees": course[5],
                     "creation_date": course[6].strftime('%Y-%m-%d %H:%M:%S')}
                    for course in courses]
        return jsonify(response)
    
    if request.method == "POST":
        course = request.get_json()
        cursor = conn.cursor()

        # Insert the new course into the database
        cursor.execute('INSERT INTO course_table (course_name, course_description, user_id, course_duration, enrollment_fee, creation_date) VALUES(%s, %s, %s, %s, %s, %s);',
                       (course['course_name'], course['course_description'], course['user_id'], course['course_duration'], course['enrollment_fee'], datetime.now()))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "Inserted"})


@app.route('/courses/<int:course_id>', methods=["PUT", "DELETE"])
@authorization
@cross_origin(origins='*')
def update_or_delete_course(course_id):
    conn = connection()
    if request.method == "PUT":
        course = request.get_json()
        cursor = conn.cursor()

        # Update the course in the database
        cursor.execute('UPDATE course_table SET course_name = %s, course_description = %s, instructor_id = %s, course_duration = %s, enrollment_fees = %s WHERE course_id = %s;',
                       (course['course_name'], course['course_description'], course['instructor_id'], course['course_duration'], course['enrollment_fees'], course_id))
        conn.commit()
        cursor.close()
        return jsonify({"status": "Updated"})

    if request.method == "DELETE":
        cursor = conn.cursor()
        cursor.execute(f"SELECT quiz_id FROM quiz_table WHERE course_id = {course_id}")
        quiz_ids = cursor.fetchall()

        for quiz_id in quiz_ids:
            for id in quiz_id:
                cursor.execute(f"DELETE FROM question_table WHERE quiz_id = {id}")
                conn.commit() 
        cursor.execute(f"DELETE FROM quiz_table WHERE course_id = {course_id}")
        cursor.execute(f"DELETE FROM course_table WHERE course_id = {course_id}")
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "Deleted"})


@app.route('/lessons', methods=["POST"])
@authorization
@cross_origin(origins='*')
def add_lesson():
    conn = connection()
    if request.method == "POST":
        lesson = request.get_json()
        cursor = conn.cursor()

        # Insert the new lesson into the database
        cursor.execute('INSERT INTO lesson_table (course_id, lesson_title, lesson_content, order, ) VALUES(%s, %s, %s, %s, %s, %s);',
                       (lesson['course_id'], lesson['lesson_title'], lesson['lesson_content'],lesson['order'], datetime.now()))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"})

@app.route('/lessons/<int:lesson_id>', methods=["PUT", "DELETE"])
@authorization
@cross_origin(origins='*')
def update_or_delete_lesson(lesson_id):
    conn = connection()
    if request.method == "PUT":
        lesson = request.get_json()
        cursor = conn.cursor()

        # Update the lesson in the database
        cursor.execute('UPDATE lesson_table SET course_id = %s, lesson_title = %s, lesson_content = %s, order = %s WHERE lesson_id = %s;',
                       (lesson['course_id'], lesson['lesson_title'], lesson['lesson_content'], lesson['order'], lesson_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"})

    elif request.method == "DELETE":
        cursor = conn.cursor()
        cursor.execute('DELETE FROM lesson_table WHERE lesson_id = %s;', (lesson_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "success"})


@app.route('/successstories', methods=["GET","POST","PUT","DELETE"])
@cross_origin(origins='*')
def success_stories():
    conn = connection()
    if request.method == "GET":
        cursor = conn.cursor()
        cursor.execute("select s.success_story_id,u.username,s.story_content,u.image from user_table as u join success_stories as s on u.user_id = s.user_id")
        success_stories = cursor.fetchall()
        cursor.close()
        conn.close()
        successstory=[]
        if not success_stories:
            return jsonify({"status":"no reviews"})
        
        for s in success_stories:
            story = {}
            story['success_story_id']=s[0]
            story['username']=s[1]
            story['story_content']=s[2]
            story['image'] = s[3]
            successstory.append(story)

        return jsonify(successstory)

    if request.method == "POST":
        data = request.get_json()
        cursor = conn.cursor()
        cursor.execute(f"INSERT INTO success_stories (user_id,course_id,story_content) VALUES ({data['user_id']},{data['course_id']},'{data['story_content']}')")
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message":"Inserted"})
    
    if request.method == "DELETE":
        story_id = request.args.get('story_id')
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM success_stories WHERE success_story_id = {story_id}")
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message":"Deleted"})


@app.route("/sendmail", methods=["POST"])
@authorization
@cross_origin(origins="*")
def send_email():
    data = request.get_json()
    email = data.get("email")
    full_name = data.get("fullName")
    message_content = data.get("message")

    msg_title = "New Contact Form Submission"
    sender = "noreply@app.com"
    receipent = "smk627751@gmail.com"
    msg = Message(msg_title, sender=sender, recipients=[receipent])
    msg_body = f"New Contact form submission by {full_name}"
    msg.body = msg_body
    data = {
        "full_name":full_name,
        "email":email,
        "message_content":message_content
    }
    msg.html = render_template('contactus.html',data=data)

    try:
        mail.send(msg)
        return jsonify({"message": "Email sent successfully."})
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to send the email."})

@app.route('/forgotpassword', methods=["POST"])
@cross_origin(origins="*")
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    # Check if the email exists in the database
    conn = connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM user_table WHERE email = '{email}'")
    user = cursor.fetchone()
    # cursor.close()
    # conn.close()

    if user:
        # Generate a random reset token
        reset_token = ''.join(random.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(64))
        cursor.execute(f"INSERT INTO otp_table (email,reset_token) values('{email}','{reset_token}')")
        conn.commit()
        cursor.close()
        conn.close()
        # Send the password reset email
        msg_title = "Password Reset Request"
        sender = "noreply@app.com"
        receipent = email
        msg = Message(msg_title, sender=sender, recipients=[receipent])
        # msg_body = f"Hi,\n\nYou have requested a password reset. Please use the following link to reset your password:\n\n{request.host_url}resetpassword/{reset_token}\n\nIf you did not request a password reset, please ignore this email."
        # msg.body = msg_body
        data = {
            "email":email,
            "url" : f"{request.host_url}resetpassword/{reset_token}"
        }
        msg.html = render_template('mail.html',data=data)
        try:
            mail.send(msg)
            return jsonify({"message": "Password reset email sent successfully."})
        except Exception as e:
            print(e)
            return jsonify({"error": "Failed to send the password reset email."})
    else:
        return jsonify({"error": "User not found."})

@app.route('/resetpassword/<string:reset_token>', methods=["GET", "POST"])
@cross_origin(origins="*")
def reset_password(reset_token):
    conn = connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM otp_table WHERE reset_token = '{reset_token}'")
    account = cursor.fetchone()
    if account:
        if request.method == "POST":
            new_password = request.form['new_password']
            # Update the user's password in the database
            email = account[1]
            cursor.execute('UPDATE user_table SET password = %s WHERE email = %s', (new_password, email))
            cursor.execute(f"DELETE FROM otp_table WHERE email = '{email}'")
            conn.commit()
            cursor.close()
            conn.close()

            return render_template('reset.html', message="Password reseted successfully")
        else:
            return render_template('reset.html', reset_token=reset_token)
        
    else:
        return jsonify({"error": "Invalid or expired reset token."})
        

if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0",port=5000)